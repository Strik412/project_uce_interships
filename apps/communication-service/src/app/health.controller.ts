import { Public } from '@app/shared';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'communication-service',
    };
  }
}
