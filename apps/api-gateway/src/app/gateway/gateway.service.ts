import { Injectable, BadGatewayException, RequestTimeoutException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class GatewayService {
  private readonly serviceUrls: Map<string, string>;
  private readonly requestTimeout: number;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.requestTimeout = this.configService.get('REQUEST_TIMEOUT', 5000);
    
    // Configuración de URLs de servicios
    this.serviceUrls = new Map([
      ['auth', this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3001')],
      // Use USER_MANAGEMENT_SERVICE_URL to match docker-compose env
      ['users', this.configService.get('USER_MANAGEMENT_SERVICE_URL', 'http://localhost:3002')],
      ['practices', this.configService.get('REGISTRATION_SERVICE_URL', 'http://localhost:3003')],
      ['progress', this.configService.get('TRACKING_SERVICE_URL', 'http://localhost:3004')],
      ['communication', this.configService.get('COMMUNICATION_SERVICE_URL', 'http://localhost:3005')],
      ['notifications', this.configService.get('NOTIFICATION_SERVICE_URL', 'http://localhost:3006')],
      ['templates', this.configService.get('NOTIFICATION_SERVICE_URL', 'http://localhost:3006')],
      ['documents', this.configService.get('DOCUMENT_SERVICE_URL', 'http://localhost:3007')],
      ['reporting', this.configService.get('REPORTING_SERVICE_URL', 'http://localhost:3008')],
    ]);
  }

  /**
   * Proxy request to target service
   */
  async proxyRequest(
    serviceName: string,
    path: string,
    method: string,
    headers: any,
    body?: any,
    queryParams?: any,
  ): Promise<any> {
    const serviceUrl = this.serviceUrls.get(serviceName);
    
    if (!serviceUrl) {
      throw new BadGatewayException(`Service ${serviceName} not configured`);
    }

    // Services that use setGlobalPrefix('api/v1')
    const servicesWithApiV1Prefix = ['auth', 'users', 'progress', 'communication', 'notifications', 'documents', 'reporting'];
    const targetUrl = servicesWithApiV1Prefix.includes(serviceName) 
      ? `${serviceUrl}/api/v1${path}`
      : `${serviceUrl}${path}`;

    try {
      const response$ = this.httpService.request({
        method: method as any,
        url: targetUrl,
        headers: this.forwardHeaders(headers),
        data: body,
        params: queryParams,
      }).pipe(
        timeout(this.requestTimeout),
        catchError((error: AxiosError) => {
          if (error.code === 'ECONNABORTED') {
            throw new RequestTimeoutException(
              `Request to ${serviceName} service timed out`,
            );
          }
          
          if (error.response) {
            // El servicio respondió con error
            throw {
              statusCode: error.response.status,
              message: error.response.data,
            };
          }
          
          // Error de conexión
          throw new BadGatewayException(
            `Cannot connect to ${serviceName} service`,
          );
        }),
      );

      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Forward headers to target service (preserve authorization)
   */
  private forwardHeaders(headers: any): any {
    const forwardedHeaders = { ...headers };
    
    // Mantener headers importantes para autenticación
    // - authorization: JWT token
    // - content-type: tipo de contenido
    // - user-agent: agente de usuario
    
    // Eliminar headers que no deben ser reenviados
    delete forwardedHeaders.host;
    delete forwardedHeaders.connection;
    delete forwardedHeaders['content-length'];
    delete forwardedHeaders['transfer-encoding'];
    
    return forwardedHeaders;
  }

  /**
   * Health check for all services
   */
  async checkServicesHealth(): Promise<any> {
    const allServices = Array.from(this.serviceUrls.entries());
    // Filter out reporting service due to DDD structure issues
    const servicesToCheck = allServices.filter(([name]) => name !== 'reporting');
    
    const healthChecks = await Promise.allSettled(
      servicesToCheck.map(async ([name, url]) => {
        try {
          // Services use different health endpoint patterns:
          // - auth (3001), notification (3006), registration (3003) use /health
          // - others use /api/v1/health
          const useRootHealth = ['auth', 'notifications', 'templates', 'practices'].includes(name);
          const healthPath = useRootHealth ? '/health' : '/api/v1/health';
          
          const response$ = this.httpService.get(`${url}${healthPath}`).pipe(
            timeout(2000),
          );
          const response = await firstValueFrom(response$);
          return {
            service: name,
            status: 'healthy',
            url,
            responseTime: response.headers['x-response-time'],
          };
        } catch (error) {
          return {
            service: name,
            status: 'unhealthy',
            url,
            error: (error as Error).message,
          };
        }
      }),
    );

    return healthChecks.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        status: 'error',
        error: result.reason,
      };
    });
  }
}
