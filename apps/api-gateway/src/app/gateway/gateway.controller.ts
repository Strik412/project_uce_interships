import {
  Controller,
  All,
  Req,
  Res,
  Get,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../guards/public.decorator';

@ApiTags('gateway')
@Controller()
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check API Gateway and all downstream services health',
  })
  async health() {
    const services = await this.gatewayService.checkServicesHealth();
    const allHealthy = services.every((s: { status: string }) => s.status === 'healthy');

    return {
      gateway: 'healthy',
      timestamp: new Date().toISOString(),
      services,
      overallStatus: allHealthy ? 'healthy' : 'degraded',
    };
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'API Gateway information',
  })
  root() {
    return {
      name: 'API Gateway',
      version: '1.0.0',
      description: 'Central gateway for Prácticas Profesionales Platform',
      services: {
        auth: '/api/v1/auth/*',
        users: '/api/v1/users/*',
        practices: '/api/v1/practices/*',
        progress: '/api/v1/progress/*',
        messages: '/api/v1/messages/*',
      },
      documentation: '/api/docs',
    };
  }

  // ==========================================
  // AUTH SERVICE PROXY (Public routes)
  // ==========================================

  @Public()
  @All('auth/register')
  @Throttle({ short: { limit: 3, ttl: 1000 } })
  @ApiExcludeEndpoint()
  async authRegister(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/register', req, res);
  }

  @Public()
  @All('auth/login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  @ApiExcludeEndpoint()
  async authLogin(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/login', req, res);
  }

  @Public()
  @All('auth/refresh')
  @ApiExcludeEndpoint()
  async authRefresh(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/refresh', req, res);
  }

  @Public()
  @All('auth/forgot-password')
  @Throttle({ medium: { limit: 3, ttl: 600000 } }) // 3 intentos por 10 min
  @ApiExcludeEndpoint()
  async authForgotPassword(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/forgot-password', req, res);
  }

  @Public()
  @All('auth/reset-password')
  @ApiExcludeEndpoint()
  async authResetPassword(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/reset-password', req, res);
  }

  // ==========================================
  // AUTH SERVICE PROXY (Protected routes)
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('auth/verify')
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  async authVerify(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/verify', req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('auth/logout')
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  async authLogout(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', '/auth/logout', req, res);
  }

  // ==========================================
  // USER MANAGEMENT SERVICE PROXY
  // ==========================================

  @Public()
  @Get('users/professors')
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async professorsList(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('users', path, req, res);
  }

  @Public()
  @Get('users/students')
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async studentsList(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('users', path, req, res);
  }

  @Public()
  @Get('users')
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async usersListProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('users', path, req, res);
  }

  @All('users/*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async usersProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('users', path, req, res);
  }

  // ==========================================
  // REGISTRATION SERVICE PROXY
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('practices*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async practicesProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('practices', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All(['applications', 'applications/*'])
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async applicationsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('practices', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All(['placements', 'placements/*'])
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async placementsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('practices', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All(['hour-logs', 'hour-logs/*'])
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async hourLogsBase(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('practices', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('assignments*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async assignmentsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    // Route assignments through Tracking Service
    return this.proxyToService('progress', path, req, res);
  }

  // ==========================================
  // TRACKING SERVICE PROXY
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('progress*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async progressProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('progress', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('milestones*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async milestonesProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('progress', path, req, res);
  }

  // ==========================================
  // COMMUNICATION SERVICE PROXY
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('messages*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async messagesProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('messages', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('conversations*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async conversationsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('communication', path, req, res);
  }

  // ==========================================
  // NOTIFICATION SERVICE PROXY
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('notifications*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async notificationsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('notifications', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('templates*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async templatesProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('templates', path, req, res);
  }

  // ==========================================
  // DOCUMENT MANAGEMENT SERVICE PROXY
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('documents*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async documentsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('documents', path, req, res);
  }

  // ==========================================
  // REPORTING & ANALYTICS SERVICE PROXY
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @All('reports*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async reportsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('reporting', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('metrics*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async metricsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('reporting', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('dashboards*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async dashboardsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('reporting', path, req, res);
  }

  @UseGuards(JwtAuthGuard)
  @All('analytics*')
  @ApiBearerAuth()
  @Throttle({ long: { limit: 100, ttl: 60000 } })
  @ApiExcludeEndpoint()
  async analyticsProxy(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/api/v1', '');
    return this.proxyToService('reporting', path, req, res);
  }

  // ==========================================
  // PRIVATE HELPER
  // ==========================================

  private async proxyToService(
    serviceName: string,
    path: string,
    req: Request,
    res: Response,
  ) {
    try {
      // Don't pass req.query separately as it's already in the path from req.url
      const result = await this.gatewayService.proxyRequest(
        serviceName,
        path,
        req.method,
        req.headers,
        req.body,
        undefined, // Query params already in path
      );

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      const status = (error as any).statusCode || HttpStatus.BAD_GATEWAY;
      const message = (error as any).message || 'Service unavailable';
      
      return res.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }
  }
}
