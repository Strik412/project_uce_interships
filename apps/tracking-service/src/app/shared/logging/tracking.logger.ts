import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TrackingLogger {
  private nestLogger = new Logger('TrackingService');

  info(message: string, meta?: any): void {
    this.nestLogger.log(message);
  }

  error(message: string, error?: Error | any): void {
    this.nestLogger.error(message, error);
  }

  warn(message: string, meta?: any): void {
    this.nestLogger.warn(message);
  }

  debug(message: string, meta?: any): void {
    this.nestLogger.debug(message);
  }

  logAssignmentOperation(operation: string, assignmentId: string, details?: any): void {
    this.info(`Assignment operation: ${operation} for ${assignmentId}`, details);
  }

  logProgressOperation(operation: string, progressId: string, assignmentId: string, details?: any): void {
    this.info(`Progress operation: ${operation} for ${progressId} (assignment: ${assignmentId})`, details);
  }

  logMilestoneOperation(operation: string, milestoneId: string, assignmentId: string, details?: any): void {
    this.info(`Milestone operation: ${operation} for ${milestoneId} (assignment: ${assignmentId})`, details);
  }
}
