"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadToken, clearToken } from '../../lib/storage';
import { getRolesFromToken, isTokenExpired, decodeJwtPayload } from '../../lib/auth';
import { getJson, postJson, patchJson } from '../../lib/api';
import type { HourLog, HourLogStats, Placement } from '../../lib/api';

export default function HourLogsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState('');
  
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const [hourLogs, setHourLogs] = useState<HourLog[]>([]);
  const [stats, setStats] = useState<HourLogStats | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [activities, setActivities] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  useEffect(() => {
    const stored = loadToken();
    if (!stored || isTokenExpired(stored)) {
      clearToken();
      router.push('/login');
      return;
    }
    setToken(stored);
    setRoles(getRolesFromToken(stored));
    
    const payload = decodeJwtPayload(stored);
    if (payload) {
      const sub = (payload as any).sub || (payload as any).userId;
      setUserId(sub || '');
    }
    
    loadPlacements(stored);
  }, [router]);

  const primaryRole = roles[0] ?? 'guest';
  const isStudent = primaryRole === 'student';
  const isProfessor = primaryRole === 'professor';
  const isCompany = primaryRole === 'company';

  async function loadPlacements(tkn: string) {
    setLoading(true);
    setError('');
    try {
      const data = await getJson<Placement[]>('placements', tkn);
      console.log('Placements loaded:', data);
      setPlacements(data || []);
      if (data && data.length > 0) {
        console.log('First placement:', data[0]);
        setSelectedPlacement(data[0]);
        await loadHourLogs(tkn, data[0].id);
        await loadStats(tkn, data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando colocaciones');
    } finally {
      setLoading(false);
    }
  }

  async function loadHourLogs(tkn: string, placementId: string) {
    setError('');
    try {
      const data = await getJson<HourLog[]>(`hour-logs?placementId=${placementId}`, tkn);
      setHourLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando registros');
    }
  }

  async function loadStats(tkn: string, placementId: string) {
    setError('');
    try {
      const data = await getJson<HourLogStats>(`hour-logs/stats/${placementId}`, tkn);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }

  async function handleCreateLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlacement) {
      setError('Select a placement');
      return;
    }
    if (!date || !hours || !description) {
      setError('Complete date, hours, and description');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        placementId: selectedPlacement.id,
        date,
        hours: parseFloat(hours),
        description,
        activities: activities || undefined,
        evidenceUrl: evidenceUrl || undefined,
      };
      
      await postJson<HourLog>('hour-logs', payload, token);

      setSuccess('Hour log created successfully');
      setDate('');
      setHours('');
      setDescription('');
      setActivities('');
      setEvidenceUrl('');
      
      await loadHourLogs(token, selectedPlacement.id);
      await loadStats(token, selectedPlacement.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating log');
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(logId: string, status: 'APPROVED' | 'REJECTED', comments: string) {
    if (!selectedPlacement) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patchJson<HourLog>(
        `hour-logs/${logId}/review`,
        { status: status.toLowerCase(), reviewerComments: comments },
        token
      );
      
      setSuccess(`Log ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
      await loadHourLogs(token, selectedPlacement.id);
      await loadStats(token, selectedPlacement.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reviewing log');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(logId: string) {
    if (!selectedPlacement) return;
    if (!confirm('Delete this log?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:4000/api/v1/hour-logs/${logId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error deleting log' }));
        throw new Error(error.message || 'Error deleting log');
      }
      
      setSuccess('Log deleted successfully');
      await loadHourLogs(token, selectedPlacement.id);
      await loadStats(token, selectedPlacement.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting log');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  function handlePlacementChange(placementId: string) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
      setSelectedPlacement(placement);
      loadHourLogs(token, placement.id);
      loadStats(token, placement.id);
    }
  }

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <main>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <div>
            <h1>Hour Logs</h1>
            <p>
              {isStudent && 'Log and view your practice hours - Requires approval from professor and company'}
              {isProfessor && 'Review and approve student hour logs - Company approval also required'}
              {isCompany && 'Review and approve student hour logs - Professor approval also required'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="pill">Role: {primaryRole}</span>
            <Link className="link" href="/dashboard">Dashboard</Link>
            <Link className="link" href="/profile">Profile</Link>
            <button onClick={handleLogout}>Log Out</button>
          </div>
        </div>
        
        {error && (
          <div style={{ padding: 12, background: 'rgba(255,100,100,0.1)', borderRadius: 8, marginTop: 12 }}>
            <p style={{ color: '#ff6666', margin: 0 }}>{error}</p>
          </div>
        )}
        
        {success && (
          <div style={{ padding: 12, background: 'rgba(125,224,221,0.1)', borderRadius: 8, marginTop: 12 }}>
            <p style={{ color: 'var(--accent)', margin: 0 }}>{success}</p>
          </div>
        )}
      </div>

      {/* Placement selector */}
      {placements.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">
            <h2>Active Placement</h2>
            <span className="badge">{selectedPlacement?.status}</span>
          </div>
          <select
            value={selectedPlacement?.id || ''}
            onChange={(e) => handlePlacementChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 14,
              fontFamily: 'inherit'
            }}
          >
            {placements.map(p => (
              <option key={p.id} value={p.id}>
                {(() => {
                  console.log('Rendering placement option:', p);
                  const practiceCode = p.practiceId || p.practice?.id;
                  console.log('Practice code:', practiceCode);
                  if (!practiceCode) return `Práctica: N/D - ${p.status}`;
                  const shortCode = practiceCode.slice(0, 8);
                  const companyLabel = p.practice?.companyName ? ` · ${p.practice.companyName}` : '';
                  return `Práctica: ${shortCode}${companyLabel} - ${p.status}`;
                })()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats card */}
      {stats && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">
            <h2>Progress Statistics</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="pill" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="small">Expected Hours</span>
              <strong style={{ fontSize: 28, marginTop: 8 }}>{stats.expectedHours}h</strong>
            </div>
            <div className="pill" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="small">Completed Hours</span>
              <strong style={{ fontSize: 28, marginTop: 8 }}>{stats.completedHours}h</strong>
            </div>
            <div className="pill" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="small">Approved Hours</span>
              <strong style={{ fontSize: 28, marginTop: 8, color: 'var(--accent)' }}>{stats.approvedHours}h</strong>
            </div>
            <div className="pill" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="small">Progress</span>
              <strong style={{ fontSize: 28, marginTop: 8 }}>{stats.progress}%</strong>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4>Status Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, background: '#fffbea', borderRadius: 8 }}>
                <span className="small">Pending Logs</span>
                <p style={{ fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>{stats.pendingLogs || 0}</p>
              </div>
              <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8 }}>
                <span className="small">Approved Logs</span>
                <p style={{ fontSize: 20, fontWeight: 'bold', marginTop: 6, color: 'var(--accent)' }}>{stats.approvedLogs || 0}</p>
              </div>
              <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8 }}>
                <span className="small">Rejected Logs</span>
                <p style={{ fontSize: 20, fontWeight: 'bold', marginTop: 6, color: '#dc2626' }}>{stats.rejectedLogs || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create form (students only) */}
      {isStudent && selectedPlacement && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">
            <h2>Register New Hours</h2>
            <span className="badge">Complete the required information</span>
          </div>
          <form onSubmit={handleCreateLog}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Date <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontSize: 14,
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Hours <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.5"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontSize: 14,
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Description <span style={{ color: '#ff4444' }}>*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  minHeight: 80,
                  resize: 'vertical'
                }}
                placeholder="Describe what you did during this internship period..."
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Activities Performed <span style={{ color: '#999', fontSize: 11 }}>(Optional)</span>
              </label>
              <textarea
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  minHeight: 60,
                  resize: 'vertical'
                }}
                placeholder="Detail the specific activities performed..."
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Evidence URL <span style={{ color: '#999', fontSize: 11 }}>(Optional)</span>
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
                placeholder="https://example.com/evidence"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? '⏳ Guardando...' : '✓ Registrar horas'}
            </button>
          </form>
        </div>
      )}

      {/* Hour logs list */}
      <div className="card">
        <div className="section-title">
          <h2>Hour Logs</h2>
          <span className="badge">{hourLogs.length} logs</span>
        </div>

        <div className="divider" />

        {hourLogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No hour logs yet</p>
            <p className="small">Start logging your internship hours</p>
          </div>
        )}

        {hourLogs.map((log) => (
          <HourLogCard
            key={log.id}
            log={log}
            isStudent={isStudent}
            isProfessor={isProfessor}
            isCompany={isCompany}
            onReview={handleReview}
            onDelete={handleDelete}
            loading={loading}
          />
        ))}
      </div>
    </main>
  );
}

interface HourLogCardProps {
  log: HourLog;
  isStudent: boolean;
  isProfessor: boolean;
  isCompany?: boolean;
  onReview: (logId: string, status: 'APPROVED' | 'REJECTED', comments: string) => void;
  onDelete: (logId: string) => void;
  loading: boolean;
}

function HourLogCard({ log, isStudent, isProfessor, isCompany = false, onReview, onDelete, loading }: HourLogCardProps) {
  const [showReview, setShowReview] = useState(false);
  const [reviewComments, setReviewComments] = useState('');

  // Normalize status to uppercase for comparison
  const normalizedStatus = (log.status || '').toUpperCase();

  const statusConfig = {
    PENDING: {
      badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: '⏳',
      label: 'Pending Review'
    },
    APPROVED: {
      badge: 'bg-green-100 text-green-800 border border-green-200',
      icon: '✓',
      label: 'Approved by Both Parties'
    },
    REJECTED: {
      badge: 'bg-red-100 text-red-800 border border-red-200',
      icon: '✕',
      label: 'Rejected'
    },
  };

  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || {
    badge: 'bg-gray-100 text-gray-800 border border-gray-200',
    icon: '?',
    label: log.status || 'Unknown'
  };
  
  // Check partial approvals
  const teacherApproved = !!log.teacherApprovedBy;
  const companyApproved = !!log.companyApprovedBy;
  const isPending = normalizedStatus === 'PENDING';

  return (
    <div className="px-6 py-5 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              📅 {new Date(log.date).toLocaleDateString('es-ES', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              ⏱️ {log.hours}h
            </span>
          </div>

          {/* Approval Status for Dual Approval */}
          {isPending && (teacherApproved || companyApproved) && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">Approval Status:</p>
              <div className="flex gap-3 text-xs">
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${teacherApproved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  <span>{teacherApproved ? '✓' : '○'}</span>
                  <span>Teacher</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${companyApproved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  <span>{companyApproved ? '✓' : '○'}</span>
                  <span>Company</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-900 font-semibold text-base">{log.description}</p>
            </div>
            
            {log.activities && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-1">Activities</p>
                <p className="text-sm text-blue-800">{log.activities}</p>
              </div>
            )}
            
            {log.evidenceUrl && (
              <div>
                <a
                  href={log.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  🔗 View Evidence
                </a>
              </div>
            )}
            
            {/* Teacher Approval Comments */}
            {log.teacherApprovalComments && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-purple-900 mb-1 flex items-center">
                  👨‍🏫 Teacher Comments
                </p>
                <p className="text-sm text-purple-800">{log.teacherApprovalComments}</p>
                {log.teacherApprovedAt && (
                  <p className="text-xs text-purple-700 mt-2 pt-2 border-t border-purple-200">
                    Approved on {new Date(log.teacherApprovedAt).toLocaleDateString('en-US')}
                  </p>
                )}
              </div>
            )}

            {/* Company Approval Comments */}
            {log.companyApprovalComments && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="font-semibold text-teal-900 mb-1 flex items-center">
                  🏢 Company Comments
                </p>
                <p className="text-sm text-teal-800">{log.companyApprovalComments}</p>
                {log.companyApprovedAt && (
                  <p className="text-xs text-teal-700 mt-2 pt-2 border-t border-teal-200">
                    Approved on {new Date(log.companyApprovedAt).toLocaleDateString('en-US')}
                  </p>
                )}
              </div>
            )}
            
            {/* Legacy reviewer comments (for rejection or old data) */}
            {log.reviewerComments && !log.teacherApprovalComments && !log.companyApprovalComments && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-amber-900 mb-1 flex items-center">
                  💬 Reviewer Comments
                </p>
                <p className="text-sm text-amber-800">{log.reviewerComments}</p>
                {log.reviewedBy && (
                  <p className="text-xs text-amber-700 mt-2 pt-2 border-t border-amber-200">
                    Reviewed on {new Date(log.reviewedAt || '').toLocaleDateString('en-US')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex flex-col space-y-2 min-w-max">
          {isStudent && normalizedStatus === 'PENDING' && (
            <button
              onClick={() => onDelete(log.id)}
              disabled={loading}
              className="text-sm px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              🗑️ Delete
            </button>
          )}
          
          {(isProfessor || isCompany) && normalizedStatus === 'PENDING' && (
            <>
              {!showReview ? (
                <button
                  onClick={() => setShowReview(true)}
                  disabled={(isProfessor && !!log.teacherApprovedBy) || (isCompany && !!log.companyApprovedBy)}
                  className="text-sm px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isProfessor && log.teacherApprovedBy ? 'Ya has aprobado estas horas' : isCompany && log.companyApprovedBy ? 'Ya has aprobado estas horas' : ''}
                >
                  ✏️ {isProfessor ? 'Profesor' : 'Empresa'}: {isProfessor && log.teacherApprovedBy ? '✓' : isCompany && log.companyApprovedBy ? '✓' : 'Revisar'}
                </button>
              ) : (
                <div className="flex flex-col space-y-2 min-w-[240px] bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900">
                    {isProfessor ? 'Aprobación del profesor' : 'Aprobación de la empresa'}
                  </p>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Comentarios (opcional)"
                    rows={2}
                    className="text-sm border border-blue-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        onReview(log.id, 'APPROVED', reviewComments);
                        setShowReview(false);
                        setReviewComments('');
                      }}
                      disabled={loading}
                      className="flex-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        onReview(log.id, 'REJECTED', reviewComments);
                        setShowReview(false);
                        setReviewComments('');
                      }}
                      disabled={loading}
                      className="flex-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      ✕ Reject
                    </button>
                  </div>
                  <button
                    onClick={() => setShowReview(false)}
                    className="text-xs text-gray-600 hover:text-gray-800 py-1 hover:bg-gray-200 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
