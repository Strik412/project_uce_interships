import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from '../application/dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto, AddWidgetDto, DashboardResponseDto } from '../dto/dashboard.dto';
import { DashboardType, DashboardWidget } from '../domain/dashboard.entity';

@ApiTags('Dashboards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  @ApiResponse({ status: 201, description: 'Dashboard created', type: DashboardResponseDto })
  async createDashboard(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.createDashboard(createDashboardDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  @ApiResponse({ status: 200, description: 'Dashboard details', type: DashboardResponseDto })
  async getDashboardById(@Param('id') id: string) {
    return this.dashboardService.getDashboardById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all dashboards for a user' })
  @ApiResponse({ status: 200, description: 'List of dashboards', type: [DashboardResponseDto] })
  async getDashboardsByUserId(@Param('userId') userId: string) {
    return this.dashboardService.getDashboardsByUserId(userId);
  }

  @Get('user/:userId/type/:type')
  @ApiOperation({ summary: 'Get dashboards by type for a user' })
  @ApiResponse({ status: 200, description: 'List of dashboards', type: [DashboardResponseDto] })
  async getDashboardsByUserIdAndType(
    @Param('userId') userId: string,
    @Param('type') type: DashboardType,
  ) {
    return this.dashboardService.getDashboardsByUserIdAndType(userId, type);
  }

  @Get('user/:userId/default')
  @ApiOperation({ summary: 'Get default dashboard for a user' })
  @ApiResponse({ status: 200, description: 'Default dashboard', type: DashboardResponseDto })
  async getDefaultDashboard(@Param('userId') userId: string) {
    const dashboard = await this.dashboardService.getDefaultDashboard(userId);
    if (!dashboard) {
      throw new NotFoundException('No default dashboard found');
    }
    return dashboard;
  }

  @Get('user/:userId/active')
  @ApiOperation({ summary: 'Get active dashboards for a user' })
  @ApiResponse({ status: 200, description: 'List of active dashboards' })
  async getActiveDashboards(@Param('userId') userId: string) {
    return this.dashboardService.getActiveDashboards(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard updated', type: DashboardResponseDto })
  async updateDashboard(@Param('id') id: string, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.updateDashboard(id, updateDashboardDto);
  }

  @Post(':id/widgets')
  @ApiOperation({ summary: 'Add a widget to a dashboard' })
  @ApiResponse({ status: 200, description: 'Widget added', type: DashboardResponseDto })
  async addWidget(@Param('id') id: string, @Body() addWidgetDto: AddWidgetDto) {
    return this.dashboardService.addWidget(id, addWidgetDto);
  }

  @Delete(':id/widgets/:widgetId')
  @ApiOperation({ summary: 'Remove a widget from a dashboard' })
  @ApiResponse({ status: 200, description: 'Widget removed', type: DashboardResponseDto })
  async removeWidget(@Param('id') id: string, @Param('widgetId') widgetId: string) {
    return this.dashboardService.removeWidget(id, widgetId);
  }

  @Put(':id/widgets/reorder')
  @ApiOperation({ summary: 'Reorder dashboard widgets' })
  @ApiResponse({ status: 200, description: 'Widgets reordered', type: DashboardResponseDto })
  async reorderWidgets(@Param('id') id: string, @Body() body: { widgets: DashboardWidget[] }) {
    return this.dashboardService.reorderWidgets(id, body.widgets);
  }

  @Post(':id/set-default')
  @ApiOperation({ summary: 'Set dashboard as default for a user' })
  @ApiResponse({ status: 200, description: 'Dashboard set as default' })
  async setAsDefault(@Param('id') id: string, @Query('userId') userId: string) {
    return this.dashboardService.setAsDefault(id, userId);
  }

  @Post(':id/viewed')
  @ApiOperation({ summary: 'Update last viewed timestamp' })
  @ApiResponse({ status: 200, description: 'Last viewed updated' })
  async updateLastViewedAt(@Param('id') id: string) {
    return this.dashboardService.updateLastViewedAt(id);
  }

  @Put(':id/theme')
  @ApiOperation({ summary: 'Update dashboard theme' })
  @ApiResponse({ status: 200, description: 'Theme updated' })
  async updateTheme(@Param('id') id: string, @Body() body: { theme: string }) {
    return this.dashboardService.updateTheme(id, body.theme);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dashboard' })
  @ApiResponse({ status: 204, description: 'Dashboard deleted' })
  async deleteDashboard(@Param('id') id: string) {
    await this.dashboardService.deleteDashboard(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete all dashboards for a user' })
  @ApiResponse({ status: 200, description: 'Dashboards deleted' })
  async deleteDashboardsByUserId(@Param('userId') userId: string) {
    const count = await this.dashboardService.deleteDashboardsByUserId(userId);
    return { deleted: count };
  }

  @Get('user/:userId/count')
  @ApiOperation({ summary: 'Count dashboards for a user' })
  @ApiResponse({ status: 200, description: 'Dashboard count' })
  async countDashboardsByUser(@Param('userId') userId: string) {
    const count = await this.dashboardService.countDashboardsByUser(userId);
    return { count };
  }
}
