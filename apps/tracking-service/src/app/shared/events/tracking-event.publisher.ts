import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

export interface TrackingEvent {
  eventType: string;
  data: any;
  timestamp: Date;
  service: string;
}

@Injectable()
export class TrackingEventPublisher {
  private kafkaClient: ClientProxy;

  constructor() {
    this.kafkaClient = ClientProxyFactory.create({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'tracking-service',
          brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        },
        consumer: {
          groupId: 'tracking-service-group',
        },
      },
    });
  }

  async publishAssignmentCreated(assignmentId: string, data: any): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'assignment.created',
      data: { assignmentId, ...data },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.assignment.created', event);
  }

  async publishAssignmentStarted(assignmentId: string, data: any): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'assignment.started',
      data: { assignmentId, ...data },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.assignment.started', event);
  }

  async publishAssignmentCompleted(assignmentId: string, data: any): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'assignment.completed',
      data: { assignmentId, ...data },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.assignment.completed', event);
  }

  async publishAssignmentPaused(assignmentId: string, data: any): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'assignment.paused',
      data: { assignmentId, ...data },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.assignment.paused', event);
  }

  async publishProgressSubmitted(progressId: string, assignmentId: string, weekNumber: number): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'progress.submitted',
      data: { progressId, assignmentId, weekNumber },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.progress.submitted', event);
  }

  async publishProgressApproved(progressId: string, assignmentId: string): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'progress.approved',
      data: { progressId, assignmentId },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.progress.approved', event);
  }

  async publishProgressRejected(progressId: string, assignmentId: string): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'progress.rejected',
      data: { progressId, assignmentId },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.progress.rejected', event);
  }

  async publishMilestoneCreated(milestoneId: string, assignmentId: string, title: string): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'milestone.created',
      data: { milestoneId, assignmentId, title },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.milestone.created', event);
  }

  async publishMilestoneCompleted(milestoneId: string, assignmentId: string): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'milestone.completed',
      data: { milestoneId, assignmentId },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.milestone.completed', event);
  }

  async publishMilestoneOverdue(milestoneId: string, assignmentId: string, dueDate: Date): Promise<void> {
    const event: TrackingEvent = {
      eventType: 'milestone.overdue',
      data: { milestoneId, assignmentId, dueDate },
      timestamp: new Date(),
      service: 'tracking-service',
    };

    this.kafkaClient.emit('tracking.milestone.overdue', event);
  }
}
