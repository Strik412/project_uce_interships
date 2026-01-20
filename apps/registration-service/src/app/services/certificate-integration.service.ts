import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface GenerateCertificatePayload {
  placementId: string;
  studentId: string;
  studentName: string;
  professorId: string;
  professorName: string;
  practiceName: string;
  totalHours: number;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class CertificateIntegrationService {
  private readonly logger = new Logger(CertificateIntegrationService.name);
  private readonly documentServiceUrl: string;
  private readonly documentServicePort: string;

  constructor(private configService: ConfigService) {
    this.documentServicePort = this.configService.get('DOCUMENT_SERVICE_PORT', '3007');
    this.documentServiceUrl = `http://localhost:${this.documentServicePort}`;
  }

  async generateCertificate(payload: GenerateCertificatePayload): Promise<any> {
    try {
      this.logger.log(
        `Triggering certificate generation for placement ${payload.placementId} and student ${payload.studentId}`,
      );

      const response = await axios.post(
        `${this.documentServiceUrl}/api/v1/certificates/generate`,
        {
          placementId: payload.placementId,
          studentId: payload.studentId,
          studentName: payload.studentName,
          professorId: payload.professorId,
          professorName: payload.professorName,
          practiceName: payload.practiceName,
          totalHours: payload.totalHours,
          startDate: payload.startDate,
          endDate: payload.endDate,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Certificate generated successfully for placement ${payload.placementId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to generate certificate for placement ${payload.placementId}: ${error instanceof AxiosError ? error.message : String(error)}`,
      );
      // Log but don't throw - certificate generation failure shouldn't block placement completion
      // The user can manually trigger certificate generation later
      return null;
    }
  }
}
