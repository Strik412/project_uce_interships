import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackingCacheService {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    try {
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + ttl * 1000,
      });
      return true;
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async deletePattern(pattern: string): Promise<number> {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  async clear(): Promise<boolean> {
    try {
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Assignment cache operations
  getAssignmentKey(assignmentId: string): string {
    return `assignment:${assignmentId}`;
  }

  cacheAssignment(assignmentId: string, data: any, ttl: number = 600): Promise<boolean> {
    return this.set(this.getAssignmentKey(assignmentId), data, ttl);
  }

  getAssignmentCache(assignmentId: string): Promise<any> {
    return this.get(this.getAssignmentKey(assignmentId));
  }

  invalidateAssignmentCache(assignmentId: string): Promise<boolean> {
    return this.delete(this.getAssignmentKey(assignmentId));
  }

  // Progress cache operations
  getProgressKey(progressId: string): string {
    return `progress:${progressId}`;
  }

  cacheProgress(progressId: string, data: any, ttl: number = 600): Promise<boolean> {
    return this.set(this.getProgressKey(progressId), data, ttl);
  }

  getProgressCache(progressId: string): Promise<any> {
    return this.get(this.getProgressKey(progressId));
  }

  invalidateProgressCache(progressId: string): Promise<boolean> {
    return this.delete(this.getProgressKey(progressId));
  }

  // Milestone cache operations
  getMilestoneKey(milestoneId: string): string {
    return `milestone:${milestoneId}`;
  }

  cacheMilestone(milestoneId: string, data: any, ttl: number = 600): Promise<boolean> {
    return this.set(this.getMilestoneKey(milestoneId), data, ttl);
  }

  getMilestoneCache(milestoneId: string): Promise<any> {
    return this.get(this.getMilestoneKey(milestoneId));
  }

  invalidateMilestoneCache(milestoneId: string): Promise<boolean> {
    return this.delete(this.getMilestoneKey(milestoneId));
  }

  // Bulk cache invalidation
  async invalidateAssignmentRelated(assignmentId: string): Promise<void> {
    await this.deletePattern(`assignment:${assignmentId}:.*`);
  }
}
