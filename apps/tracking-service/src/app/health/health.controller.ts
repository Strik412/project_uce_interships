import { Controller, Get } from '@nestjs/common';
import { Public } from '@app/shared'; // según tu proyecto

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'tracking-service', timestamp: new Date().toISOString() };
  }
}
