import { Public } from '@app/shared';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'document-management-service', timestamp: new Date().toISOString() };
  }
}
