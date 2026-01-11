import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Enriquece el contexto de autenticación para servicios descendentes
 * Agrega headers con información de usuario autenticado
 */
@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Si el usuario está autenticado, enriquecer el contexto
    if (request.user) {
      const user = request.user as any;
      
      // Agregar headers personalizados para servicios descendentes
      request.headers['x-user-id'] = user.userId || '';
      request.headers['x-user-email'] = user.email || '';
      request.headers['x-user-roles'] = JSON.stringify(user.roles || []);
      
      // El header Authorization ya está presente por el JWT
    }
    
    return next.handle();
  }
}
