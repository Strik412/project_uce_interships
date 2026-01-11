import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@app/shared';

@ApiTags('health')
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the service is running',
  })
  health(): { status: string; timestamp: string; service: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'notification-service',
    };
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Returns service information',
  })
  root(): { message: string; version: string } {
    return {
      message: 'Notification Service API v1',
      version: '1.0.0',
    };
  }
}
