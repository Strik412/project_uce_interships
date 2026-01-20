import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus, DocumentType } from '../domain/document.entity';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(Document)
    private readonly repository: Repository<Document>,
  ) {}

  async create(document: Partial<Document>): Promise<Document> {
    const newDocument = this.repository.create(document);
    return this.repository.save(newDocument);
  }

  async findById(id: string): Promise<Document | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Document[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByPracticeId(practiceId: string): Promise<Document[]> {
    return this.repository.find({
      where: { practiceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: DocumentType): Promise<Document[]> {
    return this.repository.find({
      where: { type },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: DocumentStatus): Promise<Document[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdAndStatus(userId: string, status: DocumentStatus): Promise<Document[]> {
    return this.repository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  async findSharedWithUser(userId: string): Promise<Document[]> {
    return this.repository
      .createQueryBuilder('document')
      .where(':userId = ANY(document.sharedWith)', { userId })
      .orderBy('document.createdAt', 'DESC')
      .getMany();
  }

  async findPendingApproval(): Promise<Document[]> {
    return this.repository.find({
      where: { status: DocumentStatus.PENDING_APPROVAL },
      order: { createdAt: 'ASC' },
    });
  }

  async findExpiredDocuments(): Promise<Document[]> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('document')
      .where('document.expiresAt < :now AND document.status != :archived', {
        now,
        archived: DocumentStatus.ARCHIVED,
      })
      .orderBy('document.expiresAt', 'ASC')
      .getMany();
  }

  async findVersions(parentDocumentId: string): Promise<Document[]> {
    return this.repository.find({
      where: { parentDocumentId },
      order: { version: 'DESC' },
    });
  }

  async update(id: string, document: Partial<Document>): Promise<Document | null> {
    await this.repository.update(id, document);
    return this.findById(id);
  }

  async approve(id: string, approvedBy: string): Promise<Document | null> {
    return this.update(id, {
      status: DocumentStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy,
    });
  }

  async reject(id: string, reason: string, rejectedBy: string): Promise<Document | null> {
    return this.update(id, {
      status: DocumentStatus.REJECTED,
      rejectionReason: reason,
      approvedBy: rejectedBy,
    });
  }

  async archive(id: string): Promise<Document | null> {
    return this.update(id, { status: DocumentStatus.ARCHIVED });
  }

  async shareWith(id: string, userIds: string[]): Promise<Document | null> {
    return this.update(id, { sharedWith: userIds });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Document[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
