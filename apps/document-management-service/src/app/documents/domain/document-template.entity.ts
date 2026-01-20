import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemplateType {
  CONTRACT = 'contract',
  EVALUATION = 'evaluation',
  REPORT = 'report',
}

@Entity('document_templates')
@Index(['type'])
@Index(['active'])
export class DocumentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 20, default: TemplateType.REPORT })
  type!: TemplateType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  htmlContent?: string;

  @Column({ type: 'varchar', array: true, default: () => 'ARRAY[]::varchar[]' })
  variables!: string[];

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
