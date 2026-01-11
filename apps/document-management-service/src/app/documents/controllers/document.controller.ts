import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentService } from '../services/document.service';
import {
  UploadDocumentDto,
  UpdateDocumentDto,
  ApproveDocumentDto,
  RejectDocumentDto,
  ShareDocumentDto,
  DocumentResponseDto,
} from './dto/document.dto';

@Controller('documents')
@ApiTags('Documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  async uploadDocument(
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Query('userId') userId: string,
  ) {
    const document = await this.documentService.uploadDocument(
      userId,
      uploadDocumentDto.title,
      uploadDocumentDto.description || '',
      uploadDocumentDto.type,
      uploadDocumentDto.fileUrl,
      uploadDocumentDto.mimeType,
      uploadDocumentDto.fileSize,
      uploadDocumentDto.practiceId,
    );
    return this.toResponseDto(document);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({
    status: 200,
    description: 'List of all documents',
    type: [DocumentResponseDto],
  })
  async getAllDocuments() {
    const documents = await this.documentService.getAllDocuments();
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get documents by user' })
  @ApiResponse({
    status: 200,
    description: 'List of user documents',
    type: [DocumentResponseDto],
  })
  async getUserDocuments(@Param('userId') userId: string) {
    const documents = await this.documentService.getUserDocuments(userId);
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Get('practice/:practiceId')
  @ApiOperation({ summary: 'Get documents by practice' })
  @ApiResponse({
    status: 200,
    description: 'List of practice documents',
    type: [DocumentResponseDto],
  })
  async getPracticeDocuments(@Param('practiceId') practiceId: string) {
    const documents = await this.documentService.getPracticeDocuments(practiceId);
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Get('pending-approval')
  @ApiOperation({ summary: 'Get documents pending approval' })
  @ApiResponse({
    status: 200,
    description: 'List of documents pending approval',
    type: [DocumentResponseDto],
  })
  async getPendingApprovalDocuments() {
    const documents = await this.documentService.getPendingApprovalDocuments();
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired documents' })
  @ApiResponse({
    status: 200,
    description: 'List of expired documents',
    type: [DocumentResponseDto],
  })
  async getExpiredDocuments() {
    const documents = await this.documentService.getExpiredDocuments();
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Get('shared/:userId')
  @ApiOperation({ summary: 'Get documents shared with user' })
  @ApiResponse({
    status: 200,
    description: 'List of shared documents',
    type: [DocumentResponseDto],
  })
  async getSharedDocuments(@Param('userId') userId: string) {
    const documents = await this.documentService.getSharedDocuments(userId);
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Document details',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    const document = await this.documentService.getDocumentById(id, userId);
    return this.toResponseDto(document);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocument(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    const document = await this.documentService.updateDocument(id, updateDocumentDto);
    return this.toResponseDto(document);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve a document' })
  @ApiResponse({
    status: 200,
    description: 'Document approved successfully',
    type: DocumentResponseDto,
  })
  async approveDocument(
    @Param('id') id: string,
    @Body() approveDocumentDto: ApproveDocumentDto,
  ) {
    const document = await this.documentService.approveDocument(
      id,
      approveDocumentDto.approvedBy,
    );
    return this.toResponseDto(document);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a document' })
  @ApiResponse({
    status: 200,
    description: 'Document rejected successfully',
    type: DocumentResponseDto,
  })
  async rejectDocument(
    @Param('id') id: string,
    @Body() rejectDocumentDto: RejectDocumentDto,
  ) {
    const document = await this.documentService.rejectDocument(
      id,
      rejectDocumentDto.reason,
      rejectDocumentDto.rejectedBy,
    );
    return this.toResponseDto(document);
  }

  @Put(':id/share')
  @ApiOperation({ summary: 'Share a document with users' })
  @ApiResponse({
    status: 200,
    description: 'Document shared successfully',
    type: DocumentResponseDto,
  })
  async shareDocument(
    @Param('id') id: string,
    @Body() shareDocumentDto: ShareDocumentDto,
  ) {
    const document = await this.documentService.shareDocument(
      id,
      shareDocumentDto.userIds,
    );
    return this.toResponseDto(document);
  }

  @Put(':id/archive')
  @ApiOperation({ summary: 'Archive a document' })
  @ApiResponse({
    status: 200,
    description: 'Document archived successfully',
    type: DocumentResponseDto,
  })
  async archiveDocument(@Param('id') id: string) {
    const document = await this.documentService.archiveDocument(id);
    return this.toResponseDto(document);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get document versions' })
  @ApiResponse({
    status: 200,
    description: 'List of document versions',
    type: [DocumentResponseDto],
  })
  async getDocumentVersions(@Param('id') id: string) {
    const documents = await this.documentService.getDocumentVersions(id);
    return documents.map((d: any) => this.toResponseDto(d));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string) {
    await this.documentService.deleteDocument(id);
  }

  private toResponseDto(document: any): DocumentResponseDto {
    return {
      id: document.id,
      userId: document.userId,
      practiceId: document.practiceId,
      title: document.title,
      description: document.description,
      type: document.type,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      status: document.status,
      accessLevel: document.accessLevel,
      uploadedBy: document.uploadedBy,
      sharedWith: document.sharedWith,
      version: document.version,
      metadata: document.metadata,
      approvedAt: document.approvedAt,
      approvedBy: document.approvedBy,
      rejectionReason: document.rejectionReason,
      expiresAt: document.expiresAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
