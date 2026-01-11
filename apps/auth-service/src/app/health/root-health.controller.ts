import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { Public } from '@app/shared';

@ApiExcludeController()
@Controller()
export class RootHealthController {
  @Get('health')
  @ApiOperation({
    summary: 'Root health check',
    description: 'Health check accessible at /health without api/v1 prefix',
  })
  @Public()
  health(): { status: string; timestamp: string; service: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    };
  }
}
