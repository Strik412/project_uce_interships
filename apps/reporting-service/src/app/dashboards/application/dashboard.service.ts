import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Dashboard, DashboardType, DashboardWidget } from '../domain/dashboard.entity';
import { DashboardRepository } from '../infrastructure/dashboard.repository';
import { CreateDashboardDto, UpdateDashboardDto, AddWidgetDto } from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async createDashboard(createDashboardDto: CreateDashboardDto): Promise<Dashboard> {
    const existingDefault = await this.dashboardRepository.findDefaultDashboard(
      createDashboardDto.userId,
    );

    const dashboard = this.dashboardRepository.create({
      userId: createDashboardDto.userId,
      name: createDashboardDto.name,
      type: createDashboardDto.type || DashboardType.STUDENT,
      description: createDashboardDto.description,
      widgets: createDashboardDto.widgets || [],
      isDefault: createDashboardDto.isDefault && !existingDefault,
      refreshInterval: createDashboardDto.refreshInterval || 15,
      theme: createDashboardDto.theme || 'light',
    });
    return this.dashboardRepository.save(dashboard);
  }

  async getDashboardById(id: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findDashboardById(id);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  async getDashboardByIdAndUser(id: string, userId: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findDashboardByIdAndUser(id, userId);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  async getDashboardsByUserId(userId: string): Promise<Dashboard[]> {
    return this.dashboardRepository.findByUserId(userId);
  }

  async getDashboardsByUserIdAndType(userId: string, type: DashboardType): Promise<Dashboard[]> {
    return this.dashboardRepository.findByUserIdAndType(userId, type);
  }

  async getDefaultDashboard(userId: string): Promise<Dashboard | null> {
    return this.dashboardRepository.findDefaultDashboard(userId);
  }

  async getActiveDashboards(userId: string): Promise<Dashboard[]> {
    return this.dashboardRepository.findActiveDashboards(userId);
  }

  async updateDashboard(id: string, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(id);

    if (updateDashboardDto.isDefault && !dashboard.isDefault) {
      await this.dashboardRepository.setAsDefault(id, dashboard.userId);
    }

    const updated = await this.dashboardRepository.updateDashboard(id, updateDashboardDto);
    if (!updated) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return updated;
  }

  async addWidget(dashboardId: string, addWidgetDto: AddWidgetDto): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);

    const widget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: addWidgetDto.type,
      title: addWidgetDto.title,
      order: dashboard.widgets.length,
      metricType: addWidgetDto.metricType,
      chartType: addWidgetDto.chartType,
      size: addWidgetDto.size || 'medium',
      refreshInterval: addWidgetDto.refreshInterval,
      filters: addWidgetDto.filters,
    };

    dashboard.widgets.push(widget);
    const updated = await this.dashboardRepository.updateWidgets(dashboardId, dashboard.widgets);
    if (!updated) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }
    return updated;
  }

  async removeWidget(dashboardId: string, widgetId: string): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);

    dashboard.widgets = dashboard.widgets.filter((w: any) => w.id !== widgetId);
    const updated = await this.dashboardRepository.updateWidgets(dashboardId, dashboard.widgets);
    if (!updated) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }
    return updated;
  }

  async reorderWidgets(dashboardId: string, widgets: DashboardWidget[]): Promise<Dashboard> {
    const updated = await this.dashboardRepository.updateWidgets(dashboardId, widgets);
    if (!updated) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }
    return updated;
  }

  async setAsDefault(id: string, userId: string): Promise<Dashboard> {
    const dashboard = await this.getDashboardByIdAndUser(id, userId);
    await this.dashboardRepository.setAsDefault(id, userId);
    dashboard.isDefault = true;
    return dashboard;
  }

  async updateLastViewedAt(id: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.updateLastViewedAt(id);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  async updateTheme(id: string, theme: string): Promise<Dashboard> {
    return this.updateDashboard(id, { theme } as UpdateDashboardDto);
  }

  async deleteDashboard(id: string): Promise<void> {
    const dashboard = await this.getDashboardById(id);
    if (dashboard.isDefault) {
      throw new BadRequestException('Cannot delete default dashboard');
    }
    await this.dashboardRepository.deactivateDashboard(id);
  }

  async deleteDashboardsByUserId(userId: string): Promise<number> {
    const dashboards = await this.dashboardRepository.findByUserId(userId);
    for (const dashboard of dashboards) {
      await this.dashboardRepository.deactivateDashboard(dashboard.id);
    }
    return dashboards.length;
  }

  async countDashboardsByUser(userId: string): Promise<number> {
    return this.dashboardRepository.countByUser(userId);
  }
}
