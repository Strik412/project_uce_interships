import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { Document, DocumentStatus, DocumentType, DocumentAccessLevel } from '../domain/document.entity';

@Injectable()
export class DocumentService {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async uploadDocument(
    userId: string,
    title: string,
    description: string,
    type: DocumentType,
    fileUrl: string,
    mimeType?: string,
    fileSize?: number,
    practiceId?: string,
  ): Promise<Document> {
    if (!title || !fileUrl) {
      throw new BadRequestException('Title and fileUrl are required');
    }

    return this.documentRepository.create({
      userId,
      title,
      description,
      type,
      fileUrl,
      mimeType,
      fileSize,
      practiceId,
      status: DocumentStatus.DRAFT,
      uploadedBy: userId,
    });
  }

  async getDocumentById(id: string, userId?: string): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check access permissions
    if (
      document.accessLevel === DocumentAccessLevel.PRIVATE &&
      document.userId !== userId &&
      !document.sharedWith.includes(userId || '')
    ) {
      throw new ForbiddenException('Access denied to this document');
    }

    return document;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return this.documentRepository.findByUserId(userId);
  }

  async getPracticeDocuments(practiceId: string): Promise<Document[]> {
    return this.documentRepository.findByPracticeId(practiceId);
  }

  async getDocumentsByType(type: DocumentType): Promise<Document[]> {
    return this.documentRepository.findByType(type);
  }

  async getPendingApprovalDocuments(): Promise<Document[]> {
    return this.documentRepository.findPendingApproval();
  }

  async getExpiredDocuments(): Promise<Document[]> {
    return this.documentRepository.findExpiredDocuments();
  }

  async getSharedDocuments(userId: string): Promise<Document[]> {
    return this.documentRepository.findSharedWithUser(userId);
  }

  async approveDocument(documentId: string, approvedBy: string): Promise<Document> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updated = await this.documentRepository.approve(documentId, approvedBy);
    if (!updated) {
      throw new Error('Failed to approve document');
    }

    return updated;
  }

  async rejectDocument(documentId: string, reason: string, rejectedBy: string): Promise<Document> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updated = await this.documentRepository.reject(documentId, reason, rejectedBy);
    if (!updated) {
      throw new Error('Failed to reject document');
    }

    return updated;
  }

  async shareDocument(documentId: string, userIds: string[]): Promise<Document> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updated = await this.documentRepository.shareWith(documentId, userIds);
    if (!updated) {
      throw new Error('Failed to share document');
    }

    return updated;
  }

  async archiveDocument(documentId: string): Promise<Document> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updated = await this.documentRepository.archive(documentId);
    if (!updated) {
      throw new Error('Failed to archive document');
    }

    return updated;
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updated = await this.documentRepository.update(documentId, updates);
    if (!updated) {
      throw new Error('Failed to update document');
    }

    return updated;
  }

  async deleteDocument(documentId: string): Promise<void> {
    const success = await this.documentRepository.delete(documentId);
    if (!success) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
  }

  async getDocumentVersions(parentDocumentId: string): Promise<Document[]> {
    return this.documentRepository.findVersions(parentDocumentId);
  }

  async getAllDocuments(): Promise<Document[]> {
    return this.documentRepository.findAll();
  }
}
