import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDto, UpdateAssignmentDto, UpdateProgressDto, AssignmentResponseDto } from './dto/assignment.dto';
import { PracticeAssignment } from '../domain/assignment.entity';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssignment(@Body() createDto: CreateAssignmentDto): Promise<PracticeAssignment> {
    return this.assignmentService.createAssignment(createDto);
  }

  @Get(':id')
  async getAssignmentById(@Param('id') id: string): Promise<PracticeAssignment> {
    return this.assignmentService.getAssignmentById(id);
  }

  @Get('student/:studentId')
  async getStudentAssignments(@Param('studentId') studentId: string): Promise<PracticeAssignment[]> {
    return this.assignmentService.getStudentAssignments(studentId);
  }

  @Get('company/:companyId')
  async getCompanyAssignments(@Param('companyId') companyId: string): Promise<PracticeAssignment[]> {
    return this.assignmentService.getCompanyAssignments(companyId);
  }

  @Get('supervisor/:supervisorId')
  async getSupervisorAssignments(@Param('supervisorId') supervisorId: string): Promise<PracticeAssignment[]> {
    return this.assignmentService.getSupervisorAssignments(supervisorId);
  }

  @Get('status/active')
  async getActiveAssignments(): Promise<PracticeAssignment[]> {
    return this.assignmentService.getActiveAssignments();
  }

  @Put(':id')
  async updateAssignment(@Param('id') id: string, @Body() updateDto: UpdateAssignmentDto): Promise<PracticeAssignment> {
    return this.assignmentService.updateAssignment(id, updateDto);
  }

  @Put(':id/progress')
  async updateProgress(@Param('id') id: string, @Body() updateDto: UpdateProgressDto): Promise<PracticeAssignment> {
    return this.assignmentService.updateProgress(id, updateDto.completedHours);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activateAssignment(@Param('id') id: string): Promise<PracticeAssignment> {
    return this.assignmentService.activateAssignment(id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeAssignment(@Param('id') id: string): Promise<PracticeAssignment> {
    return this.assignmentService.completeAssignment(id);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  async pauseAssignment(@Param('id') id: string): Promise<PracticeAssignment> {
    return this.assignmentService.pauseAssignment(id);
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  async resumeAssignment(@Param('id') id: string): Promise<PracticeAssignment> {
    return this.assignmentService.resumeAssignment(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAssignment(@Param('id') id: string): Promise<void> {
    await this.assignmentService.deleteAssignment(id);
  }
}
