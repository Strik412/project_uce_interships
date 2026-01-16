import { getJson, postJson, patchJson } from './api';

// Assignment types
export interface Assignment {
  id: string;
  studentId: string;
  companyId: string;
  supervisorId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  assignmentId: string;
  weekNumber: number;
  hoursWorked: number;
  description: string;
  attachments?: string[];
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  assignmentId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignments API
export async function getAssignments(token: string) {
  return getJson<Assignment[]>('tracking/assignments', token);
}

export async function getAssignmentById(id: string, token: string) {
  return getJson<Assignment>(`tracking/assignments/${id}`, token);
}

export async function getStudentAssignments(studentId: string, token: string) {
  return getJson<Assignment[]>(`tracking/assignments/student/${studentId}`, token);
}

export async function getCompanyAssignments(companyId: string, token: string) {
  return getJson<Assignment[]>(`tracking/assignments/company/${companyId}`, token);
}

export async function getSupervisorAssignments(supervisorId: string, token: string) {
  return getJson<Assignment[]>(`tracking/assignments/supervisor/${supervisorId}`, token);
}

export async function getActiveAssignments(token: string) {
  return getJson<Assignment[]>(`tracking/assignments/status/active`, token);
}

export async function createAssignment(
  data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>,
  token: string
) {
  return postJson<Assignment>('tracking/assignments', data, token);
}

export async function updateAssignment(
  id: string,
  data: Partial<Assignment>,
  token: string
) {
  return patchJson<Assignment>(`tracking/assignments/${id}`, data, token);
}

export async function activateAssignment(id: string, token: string) {
  return postJson<Assignment>(`tracking/assignments/${id}/activate`, {}, token);
}

export async function completeAssignment(id: string, token: string) {
  return postJson<Assignment>(`tracking/assignments/${id}/complete`, {}, token);
}

export async function pauseAssignment(id: string, token: string) {
  return postJson<Assignment>(`tracking/assignments/${id}/pause`, {}, token);
}

export async function resumeAssignment(id: string, token: string) {
  return postJson<Assignment>(`tracking/assignments/${id}/resume`, {}, token);
}

export async function deleteAssignment(id: string, token: string) {
  return postJson<void>(`tracking/assignments/${id}`, {}, token);
}

// Progress API
export async function getProgress(assignmentId: string, token: string) {
  return getJson<Progress[]>(`tracking/progress/assignment/${assignmentId}`, token);
}

export async function getProgressById(id: string, token: string) {
  return getJson<Progress>(`tracking/progress/${id}`, token);
}

export async function getProgressStats(assignmentId: string, token: string) {
  return getJson<any>(`tracking/progress/assignment/${assignmentId}/stats`, token);
}

export async function getRecentProgress(assignmentId: string, token: string) {
  return getJson<Progress[]>(`tracking/progress/assignment/${assignmentId}/recent`, token);
}

export async function submitProgress(
  data: Omit<Progress, 'id' | 'createdAt' | 'updatedAt'>,
  token: string
) {
  return postJson<Progress>('tracking/progress', data, token);
}

export async function updateProgress(
  id: string,
  data: Partial<Progress>,
  token: string
) {
  return patchJson<Progress>(`tracking/progress/${id}`, data, token);
}

export async function approveProgress(id: string, token: string) {
  return postJson<Progress>(`tracking/progress/${id}/approve`, {}, token);
}

export async function rejectProgress(id: string, token: string) {
  return postJson<Progress>(`tracking/progress/${id}/reject`, {}, token);
}

export async function requestRevision(id: string, token: string) {
  return postJson<Progress>(`tracking/progress/${id}/request-revision`, {}, token);
}

export async function deleteProgress(id: string, token: string) {
  return postJson<void>(`tracking/progress/${id}`, {}, token);
}

// Milestones API
export async function getMilestones(assignmentId: string, token: string) {
  return getJson<Milestone[]>(`tracking/milestones/assignment/${assignmentId}`, token);
}

export async function getMilestoneById(id: string, token: string) {
  return getJson<Milestone>(`tracking/milestones/${id}`, token);
}

export async function getMilestoneStats(assignmentId: string, token: string) {
  return getJson<any>(`tracking/milestones/assignment/${assignmentId}/stats`, token);
}

export async function getOverdueMilestones(token: string) {
  return getJson<Milestone[]>(`tracking/milestones/status/overdue`, token);
}

export async function getUpcomingMilestones(token: string) {
  return getJson<Milestone[]>(`tracking/milestones/status/upcoming`, token);
}

export async function createMilestone(
  data: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>,
  token: string
) {
  return postJson<Milestone>('tracking/milestones', data, token);
}

export async function updateMilestone(
  id: string,
  data: Partial<Milestone>,
  token: string
) {
  return patchJson<Milestone>(`tracking/milestones/${id}`, data, token);
}

export async function completeMilestone(id: string, token: string) {
  return postJson<Milestone>(`tracking/milestones/${id}/complete`, {}, token);
}

export async function checkOverdue(id: string, token: string) {
  return postJson<Milestone>(`tracking/milestones/${id}/check-overdue`, {}, token);
}

export async function deleteMilestone(id: string, token: string) {
  return postJson<void>(`tracking/milestones/${id}`, {}, token);
}
