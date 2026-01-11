import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para registrar información de requests en el gateway
 */
@Injectable()
export class GatewayLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('Gateway');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userInfo = (req as any).user
      ? `[${(req as any).user.email || (req as any).user.userId}]`
      : '[anonymous]';

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const message = `${method} ${originalUrl} ${userInfo} - ${res.statusCode} (${duration}ms)`;
      
      if (res.statusCode >= 500) {
        this.logger.error(message);
      } else if (res.statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.debug(message);
      }
    });

    next();
  }
}
