const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function buildUrl(path: string) {
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${trimmed}`;
}

async function request<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<T> {
  try {
    const res = await fetch(buildUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      // Extract error message from various response formats
      let message = res.statusText;
      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.message) {
          // Handle nested message objects
          if (typeof data.message === 'object' && data.message.message) {
            message = String(data.message.message);
          } else if (Array.isArray(data.message)) {
            message = data.message.join(', ');
          } else {
            message = String(data.message);
          }
        } else if (data.error) {
          message = typeof data.error === 'string' ? data.error : String(data.error);
        } else {
          // Fallback: stringify the whole object
          try {
            message = JSON.stringify(data);
          } catch {
            message = 'Error desconocido';
          }
        }
      }
      throw new Error(`${res.status}: ${message}`);
    }

    return data as T;
  } catch (error) {
    // If it's already our Error, re-throw it
    if (error instanceof Error && error.message.includes(':')) {
      throw error;
    }
    // Network or other errors
    throw new Error(`Error de red: ${error instanceof Error ? error.message : 'Conexion fallida'}`);
  }
}

export async function postJson<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, 'POST', body, token);
}

export async function getJson<T>(path: string, token?: string) {
  return request<T>(path, 'GET', undefined, token);
}

export async function patchJson<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, 'PATCH', body, token);
}

export function resolveToken(payload: Record<string, unknown>) {
  return (
    (payload as { access_token?: string }).access_token ||
    (payload as { accessToken?: string }).accessToken ||
    (payload as { token?: string }).token ||
    ''
  );
}

// Hour logs API types
export interface HourLog {
  id: string;
  placementId: string;
  studentId: string;
  date: string;
  hours: number;
  description: string;
  activities?: string;
  evidenceUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComments?: string;
  // Dual approval fields
  teacherApprovedBy?: string;
  teacherApprovedAt?: string;
  teacherApprovalComments?: string;
  companyApprovedBy?: string;
  companyApprovedAt?: string;
  companyApprovalComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HourLogStats {
  placementId: string;
  expectedHours: number;
  completedHours: string | number;
  approvedHours: number;
  pendingLogs: number;
  approvedLogs: number;
  rejectedLogs: number;
  totalLogs: number;
  progress: number;
}

export interface Placement {
  id: string;
  studentId: string;
  practiceId: string;
  professorId?: string;
  assignmentStatus?: 'pending' | 'invited' | 'accepted' | 'declined';
  supervisorAssignedAt?: string;
  assignedBy?: string;
  startDate: string;
  endDate: string;
  expectedHours: number;
  completedHours: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Practice {
  id: string;
  userId: string;
  companyName: string;
  companyLocation?: string;
  description: string;
  startDate?: string;
  endDate?: string;
  hoursCompleted: number;
  totalHours: number;
  status: string;
  validationStatus: string;
  supervisorId?: string;
  coordinatorNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  practiceId: string;
  userId: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  placementId: string;
  studentId: string;
  professorId: string;
  certificateNumber: string;
  issueDate: string;
  totalHours: number;
  practiceName: string;
  studentName: string;
  professorName: string;
  startDate: string;
  endDate: string;
  pdfUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  approvedBy?: string;
  approvedAt?: string;
  approvalComments?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export { API_BASE_URL };
