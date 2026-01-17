import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificateService } from './certificate.service';
import {
  GenerateCertificateDto,
  ApproveCertificateDto,
  RejectCertificateDto,
} from './dto/generate-certificate.dto';
import { Certificate } from './certificate.entity';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '@app/shared';

interface CurrentUserData {
  userId: string;
  email: string;
  roles: string[];
}

@ApiTags('Certificates')
@ApiBearerAuth()
@Controller('api/v1/certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post('generate')
  @Roles('admin', 'teacher', 'student')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate certificate for completed placement' })
  @ApiResponse({ status: 201, description: 'Certificate generated', type: Certificate })
  async generateCertificate(@Body() dto: GenerateCertificateDto): Promise<Certificate> {
    return this.certificateService.generateCertificate(dto);
  }

  @Get('placement/:placementId')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'Get certificate by placement ID' })
  @ApiResponse({ status: 200, description: 'Certificate found', type: Certificate })
  async getCertificateByPlacement(@Param('placementId') placementId: string) {
    return this.certificateService.getCertificateByPlacement(placementId);
  }

  @Get('student/:studentId')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'Get all certificates for a student' })
  @ApiResponse({ status: 200, description: 'List of certificates', type: [Certificate] })
  async getCertificatesByStudent(@Param('studentId') studentId: string): Promise<Certificate[]> {
    return this.certificateService.getCertificatesByStudent(studentId);
  }

  @Get('professor/:professorId')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Get all certificates for a professor' })
  @ApiResponse({ status: 200, description: 'List of certificates', type: [Certificate] })
  async getCertificatesByProfessor(
    @Param('professorId') professorId: string,
  ): Promise<Certificate[]> {
    return this.certificateService.getCertificatesByProfessor(professorId);
  }

  @Get('pending')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Get all pending certificates' })
  @ApiResponse({ status: 200, description: 'List of pending certificates', type: [Certificate] })
  async getPendingCertificates(): Promise<Certificate[]> {
    return this.certificateService.getPendingCertificates();
  }

  @Get('student/me')
  @Roles('student')
  @ApiOperation({ summary: 'Get certificates for current authenticated student' })
  @ApiResponse({ status: 200, description: 'List of certificates', type: [Certificate] })
  async getMyCertificates(@CurrentUser() user: CurrentUserData): Promise<Certificate[]> {
    return this.certificateService.getCertificatesByStudent(user.userId);
  }

  @Get(':id')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiResponse({ status: 200, description: 'Certificate details', type: Certificate })
  async getCertificate(@Param('id') id: string): Promise<Certificate> {
    return this.certificateService.getCertificateById(id);
  }

  @Patch(':id/approve')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Approve a pending certificate' })
  @ApiResponse({ status: 200, description: 'Certificate approved', type: Certificate })
  async approveCertificate(
    @Param('id') id: string,
    @Body() dto: ApproveCertificateDto,
  ): Promise<Certificate> {
    return this.certificateService.approveCertificate(id, dto.teacherId, dto.comments);
  }

  @Patch(':id/reject')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Reject a pending certificate' })
  @ApiResponse({ status: 200, description: 'Certificate rejected', type: Certificate })
  async rejectCertificate(
    @Param('id') id: string,
    @Body() dto: RejectCertificateDto,
  ): Promise<Certificate> {
    return this.certificateService.rejectCertificate(id, dto.teacherId, dto.reason);
  }

  @Patch(':id/revoke')
  @Roles('admin')
  @ApiOperation({ summary: 'Revoke a certificate (admin only)' })
  @ApiResponse({ status: 200, description: 'Certificate revoked', type: Certificate })
  async revokeCertificate(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<Certificate> {
    return this.certificateService.revokeCertificate(id, body.reason);
  }

  @Get(':id/download')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'Download certificate PDF' })
  @ApiResponse({ status: 200, description: 'PDF file stream' })
  async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
    const certificate = await this.certificateService.getCertificateById(id);
    const filepath = this.certificateService.getPdfFilePath(certificate);

    return res.download(filepath, `${certificate.certificateNumber}.pdf`, (err) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error downloading certificate',
          error: err.message,
        });
      }
    });
  }
}
