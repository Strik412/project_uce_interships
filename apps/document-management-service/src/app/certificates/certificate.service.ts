import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, CertificateStatus } from './certificate.entity';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
const PDFDocument = require('pdfkit');

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
    private httpService: HttpService,
    private configService: ConfigService,
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
      templateVersion: 1,
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
        .text((data.studentName || 'Student').toUpperCase(), { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(16)
        .font('Helvetica')
        .text('has successfully completed the internship program', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(data.practiceName || 'Internship Program', { align: 'center', width: 450 });

      doc.moveDown(1.5);

      // Details
      doc.fontSize(14).font('Helvetica').text(`Total Hours Completed: ${data.totalHours || 'N/A'}`, {
        align: 'center',
      });

      doc.moveDown(0.3);

      const startDateStr = data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'N/A';
      const endDateStr = data.endDate ? new Date(data.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'N/A';

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

      doc.fontSize(14).font('Helvetica-Bold').text(data.professorName || 'Professor', {
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
        resolve(`uploads/certificates/${filename}`);
      });

      stream.on('error', (error) => {
        this.logger.error(`PDF creation failed: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Student requests certificate for completed placement
   */
  async requestCertificateByStudent(placementId: string, studentId: string): Promise<Certificate> {
    this.logger.log(`Student ${studentId} requesting certificate for placement ${placementId}`);

    // Validate inputs
    if (!placementId || placementId.trim() === '') {
      throw new BadRequestException('Invalid placement ID');
    }
    if (!studentId || studentId.trim() === '') {
      throw new BadRequestException('Invalid student ID');
    }

    // Check if certificate already exists
    const existing = await this.certificateRepo.findOne({
      where: { placementId },
    });

    if (existing) {
      if (existing.status === CertificateStatus.PENDING) {
        throw new BadRequestException('Certificate request already pending approval');
      }
      if (existing.status === CertificateStatus.APPROVED) {
        throw new BadRequestException('Certificate already approved for this placement');
      }
      // If rejected, allow re-request by continuing
    }

    const certificateNumber = this.generateCertificateNumber();

    // Create minimal certificate request - details will be filled when teacher approves
    const certificate = this.certificateRepo.create({
      placementId: placementId.trim(),
      studentId: studentId.trim(),
      certificateNumber,
      issueDate: new Date(),
      status: CertificateStatus.PENDING,
      templateVersion: 1,
    });

    const saved = await this.certificateRepo.save(certificate);
    this.logger.log(`Certificate request created: ${certificateNumber}`);

    // Try to enrich immediately (no auth token available, but attempt anyway)
    try {
      await this.enrichFromPlacement(saved);
      return await this.certificateRepo.save(saved);
    } catch (error) {
      this.logger.warn(`Could not enrich certificate ${saved.id} during request`);
      return saved;
    }
  }

  /**
   * Approve certificate
   */
  async approveCertificate(
    id: string,
    teacherId: string,
    comments?: string,
    authHeader?: string,
  ): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.status !== CertificateStatus.PENDING) {
      throw new BadRequestException(`Cannot approve certificate in ${certificate.status} status`);
    }

    // Enrich certificate details from placement service using caller's token
    await this.enrichFromPlacement(certificate, authHeader);

    // Ensure professor linkage
    certificate.professorId = certificate.professorId || teacherId;
    if (!certificate.professorName && certificate.professorId) {
      certificate.professorName = `Professor ${certificate.professorId.slice(0, 8)}`;
    }

    // Generate PDF if not already created
    if (!certificate.pdfUrl || certificate.pdfUrl === '') {
      const pdfPath = await this.createCertificatePDF({
        certificateNumber: certificate.certificateNumber,
        issueDate: certificate.issueDate,
        studentName: certificate.studentName,
        professorName: certificate.professorName,
        practiceName: certificate.practiceName,
        totalHours: certificate.totalHours,
        startDate: certificate.startDate,
        endDate: certificate.endDate,
      });
      certificate.pdfUrl = pdfPath;
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

    // Enrich if fields are missing
    if (!certificate.studentName || !certificate.practiceName || !certificate.totalHours) {
      await this.enrichFromPlacement(certificate);
      return await this.certificateRepo.save(certificate);
    }

    return certificate;
  }

  /**
   * Get all pending certificates
   */
  async getPendingCertificates(): Promise<Certificate[]> {
    const certificates = await this.certificateRepo.find({
      where: { status: CertificateStatus.PENDING },
      order: { createdAt: 'ASC' },
    });

    // Enrich any certificates with missing data
    for (const cert of certificates) {
      if (!cert.studentName || !cert.practiceName || !cert.totalHours) {
        await this.enrichFromPlacement(cert);
        await this.certificateRepo.save(cert);
      }
    }

    return certificates;
  }

  /**
   * Get certificates by student
   */
  async getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
    const certificates = await this.certificateRepo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    // Enrich any certificates with missing data
    for (const cert of certificates) {
      if (!cert.studentName || !cert.practiceName || !cert.totalHours) {
        await this.enrichFromPlacement(cert);
        await this.certificateRepo.save(cert);
      }
    }

    return certificates;
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
    if (!certificate.pdfUrl) {
      throw new Error('Certificate PDF URL not found');
    }
    return path.join(process.cwd(), certificate.pdfUrl);
  }

  /**
   * Enrich certificate data from registration service (placements)
   */
  private async enrichFromPlacement(certificate: Certificate, authHeader?: string): Promise<void> {
    const baseUrl = this.configService.get<string>('REGISTRATION_SERVICE_URL', 'http://localhost:3003');
    if (!baseUrl || !certificate.placementId) {
      return;
    }

    try {
      const response$ = this.httpService.get(`${baseUrl}/placements/${certificate.placementId}`, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
      const placement = (await firstValueFrom(response$))?.data as any;

      if (!placement) {
        return;
      }

      // Practice name
      certificate.practiceName = placement.practice?.companyName
        || placement.practice?.name
        || certificate.practiceName;

      // Hours and dates
      const completedHours = placement.completedHours ?? placement.expectedHours;
      certificate.totalHours = completedHours !== undefined ? Number(completedHours) : certificate.totalHours;
      certificate.startDate = placement.startDate ? new Date(placement.startDate) : certificate.startDate;
      certificate.endDate = placement.endDate ? new Date(placement.endDate) : certificate.endDate;

      // IDs and fallback names
      certificate.studentId = certificate.studentId || placement.student?.id;
      if (!certificate.studentName && certificate.studentId) {
        certificate.studentName = `Student ${certificate.studentId.slice(0, 8)}`;
      }

      certificate.professorId = certificate.professorId || placement.professorId;
      if (!certificate.professorName && certificate.professorId) {
        certificate.professorName = `Professor ${certificate.professorId.slice(0, 8)}`;
      }
    } catch (error) {
      this.logger.warn(
        `Could not enrich certificate ${certificate.id} from placement service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
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
