import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  DELETED = 'deleted',
}

@Entity('messages')
@Index(['conversationId'])
@Index(['senderId'])
@Index(['receiverId'])
@Index(['createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  conversationId!: string;

  @Column({ type: 'uuid' })
  senderId!: string;

  @Column({ type: 'uuid' })
  receiverId!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 20, default: MessageStatus.SENT })
  status!: MessageStatus;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{ url: string; type: string; name: string }>;

  @Column({ type: 'boolean', default: false })
  isEdited!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
