import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, CertificateStatus } from './certificate.entity';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream } from 'fs';
const PDFDocument = require('pdfkit');

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
  ) {}

  /**
   * Generate certificate PDF and store metadata
   */
  async generateCertificate(dto: GenerateCertificateDto): Promise<Certificate> {
    this.logger.log(`Generating certificate for placement ${dto.placementId}`);

    // Check if certificate already exists for this placement
    const existing = await this.certificateRepo.findOne({
      where: { placementId: dto.placementId },
    });

    if (existing && existing.status !== CertificateStatus.REJECTED) {
      throw new BadRequestException('Certificate already exists for this placement');
    }

    // Generate unique certificate number
    const certificateNumber = this.generateCertificateNumber();

    // Create PDF
    const pdfPath = await this.createCertificatePDF({
      ...dto,
      certificateNumber,
      issueDate: new Date(),
    });

    // Save certificate metadata
    const certificate = this.certificateRepo.create({
      placementId: dto.placementId,
      studentId: dto.studentId,
      studentName: dto.studentName,
      professorId: dto.professorId,
      professorName: dto.professorName,
      practiceName: dto.practiceName,
      certificateNumber,
      issueDate: new Date(),
      description: dto.description,
      totalHours: dto.totalHours,
      startDate: dto.startDate,
      endDate: dto.endDate,
      pdfUrl: pdfPath,
      status: CertificateStatus.PENDING,
      templateVersion: 'v1.0',
    });

    const saved = await this.certificateRepo.save(certificate);
    this.logger.log(`Certificate generated: ${certificateNumber}`);

    return saved;
  }

  /**
   * Create PDF using PDFKit
   */
  private async createCertificatePDF(data: any): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'certificates');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${data.certificateNumber}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(30)
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF COMPLETION', { align: 'center' });

      doc.moveDown(2);

      // Body
      doc.fontSize(16).font('Helvetica').text('This is to certify that', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(data.studentName.toUpperCase(), { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(16)
        .font('Helvetica')
        .text('has successfully completed the internship program', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(data.practiceName, { align: 'center', width: 450 });

      doc.moveDown(1.5);

      // Details
      doc.fontSize(14).font('Helvetica').text(`Total Hours Completed: ${data.totalHours}`, {
        align: 'center',
      });

      doc.moveDown(0.3);

      const startDateStr = new Date(data.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const endDateStr = new Date(data.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.text(`Period: ${startDateStr} - ${endDateStr}`, { align: 'center' });

      doc.moveDown(2);

      // Certificate metadata
      doc.fontSize(11).font('Helvetica').text(`Certificate Number: ${data.certificateNumber}`, {
        align: 'center',
      });

      const issueDateStr = new Date(data.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Issue Date: ${issueDateStr}`, { align: 'center' });

      doc.moveDown(3);

      // Signature line
      const pageWidth = doc.page.width;
      const signatureWidth = 200;
      const signatureX = (pageWidth - signatureWidth) / 2;

      doc
        .moveTo(signatureX, doc.y)
        .lineTo(signatureX + signatureWidth, doc.y)
        .stroke();

      doc.moveDown(0.3);

      doc.fontSize(14).font('Helvetica-Bold').text(data.professorName, {
        align: 'center',
      });

      doc.fontSize(12).font('Helvetica').text('Academic Supervisor', {
        align: 'center',
      });

      // Footer
      const footerY = doc.page.height - 100;
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'This certificate is issued by the Internship Management System',
          50,
          footerY,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();

      stream.on('finish', () => {
        this.logger.log(`PDF created: ${filename}`);
        resolve(`/uploads/certificates/${filename}`);
      });

      stream.on('error', (error) => {
        this.logger.error(`PDF creation failed: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Approve certificate
   */
  async approveCertificate(
    id: string,
    teacherId: string,
    comments?: string,
  ): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.status !== CertificateStatus.PENDING) {
      throw new BadRequestException(`Cannot approve certificate in ${certificate.status} status`);
    }

    certificate.status = CertificateStatus.APPROVED;
    certificate.approvedBy = teacherId;
    certificate.approvedAt = new Date();
    certificate.approvalComments = comments;

    this.logger.log(`Certificate ${certificate.certificateNumber} approved by ${teacherId}`);

    return this.certificateRepo.save(certificate);
  }

  /**
   * Reject certificate
   */
  async rejectCertificate(id: string, teacherId: string, reason: string): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.status !== CertificateStatus.PENDING) {
      throw new BadRequestException(`Cannot reject certificate in ${certificate.status} status`);
    }

    certificate.status = CertificateStatus.REJECTED;
    certificate.rejectedBy = teacherId;
    certificate.rejectedAt = new Date();
    certificate.rejectionReason = reason;

    this.logger.log(`Certificate ${certificate.certificateNumber} rejected by ${teacherId}`);

    return this.certificateRepo.save(certificate);
  }

  /**
   * Revoke certificate (admin only)
   */
  async revokeCertificate(id: string, reason: string): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      throw new BadRequestException('Certificate is already revoked');
    }

    certificate.status = CertificateStatus.REVOKED;
    certificate.rejectionReason = reason;

    this.logger.log(`Certificate ${certificate.certificateNumber} revoked`);

    return this.certificateRepo.save(certificate);
  }

  /**
   * Get certificate by placement
   */
  async getCertificateByPlacement(placementId: string): Promise<Certificate | null> {
    return this.certificateRepo.findOne({ where: { placementId } });
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(id: string): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  /**
   * Get all pending certificates
   */
  async getPendingCertificates(): Promise<Certificate[]> {
    return this.certificateRepo.find({
      where: { status: CertificateStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get certificates by student
   */
  async getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
    return this.certificateRepo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get certificates by professor
   */
  async getCertificatesByProfessor(professorId: string): Promise<Certificate[]> {
    return this.certificateRepo.find({
      where: { professorId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get PDF file path
   */
  getPdfFilePath(certificate: Certificate): string {
    return path.join(process.cwd(), certificate.pdfUrl);
  }

  /**
   * Generate unique certificate number
   */
  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${year}-${random}`;
  }
}
