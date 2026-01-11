import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Dashboard, DashboardType } from '../domain/dashboard.entity';

@Injectable()
export class DashboardRepository extends Repository<Dashboard> {
  constructor(private dataSource: DataSource) {
    super(Dashboard, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Dashboard[]> {
    return this.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdAndType(userId: string, type: DashboardType): Promise<Dashboard[]> {
    return this.find({
      where: { userId, type, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findDefaultDashboard(userId: string): Promise<Dashboard | null> {
    return this.findOne({
      where: { userId, isDefault: true, isActive: true },
    });
  }

  async findActiveDashboards(userId: string): Promise<Dashboard[]> {
    return this.find({
      where: { userId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findDashboardById(id: string): Promise<Dashboard | null> {
    return this.findOne({
      where: { id, isActive: true },
    });
  }

  async findDashboardByIdAndUser(id: string, userId: string): Promise<Dashboard | null> {
    return this.findOne({
      where: { id, userId, isActive: true },
    });
  }

  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    return this.save(this.create(dashboard));
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard | null> {
    const dashboard = await this.findOne({ where: { id } });
    if (dashboard) {
      Object.assign(dashboard, updates);
      return this.save(dashboard);
    }
    return null;
  }

  async updateWidgets(id: string, widgets: any[]): Promise<Dashboard | null> {
    const dashboard = await this.findOne({ where: { id } });
    if (dashboard) {
      dashboard.widgets = widgets;
      return this.save(dashboard);
    }
    return null;
  }

  async setAsDefault(id: string, userId: string): Promise<void> {
    // Remove default from other dashboards
    await this.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    // Set this one as default
    await this.update(
      { id },
      { isDefault: true },
    );
  }

  async updateLastViewedAt(id: string): Promise<Dashboard | null> {
    const dashboard = await this.findOne({ where: { id } });
    if (dashboard) {
      dashboard.lastViewedAt = new Date();
      return this.save(dashboard);
    }
    return null;
  }

  async deactivateDashboard(id: string): Promise<Dashboard | null> {
    const dashboard = await this.findOne({ where: { id } });
    if (dashboard) {
      dashboard.isActive = false;
      return this.save(dashboard);
    }
    return null;
  }

  async countByUser(userId: string): Promise<number> {
    return this.count({
      where: { userId, isActive: true },
    });
  }
}
