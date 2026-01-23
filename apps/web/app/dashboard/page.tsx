"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadToken, clearToken } from '../../lib/storage';
import { getRolesFromToken, isTokenExpired, decodeJwtPayload } from '../../lib/auth';
import { getJson, postJson, patchJson } from '../../lib/api';
import type { Practice, Application, Placement } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState('');
  
  const [practices, setPractices] = useState<Practice[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [assignInput, setAssignInput] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [professors, setProfessors] = useState<Array<{ id: string; name: string }>>([]);
  const [professorsError, setProfessorsError] = useState('');
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  const primaryRole = roles[0] ?? 'guest';
  const isStudent = primaryRole === 'student';
  const isProfessor = primaryRole === 'professor';
  const isCompany = primaryRole === 'company';
  const isAdmin = primaryRole === 'admin' || primaryRole === 'coordinator';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating practice
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [totalHours, setTotalHours] = useState(240);
  const [companyLocation, setCompanyLocation] = useState('');

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
    
    async function initializeData() {
      await loadPractices(stored);
      await loadApplications(stored);
      await loadPlacements(stored);
    }
    
    initializeData();
  }, [router]);

  useEffect(() => {
    if (token && (isAdmin || isCompany)) {
      loadProfessors(token);
      loadStudents(token);
    }
  }, [token, isAdmin, isCompany]);

  function getUserLabel(id: string) {
    if (!id) return 'N/A';
    return userNames[id] || id.slice(0, 8);
  }

  function getPracticeName(id: string) {
    const practice = (practices || []).find((p) => p.id === id);
    return practice?.companyName || 'Práctica';
  }

  async function loadProfessors(tkn: string) {
    try {
      const professors = await getJson<Array<{ id: string; name: string; email: string }>>('users/professors', tkn);
      setProfessors(Array.isArray(professors) ? professors : []);
    } catch (err) {
      console.error('Error loading professors:', err);
      setProfessorsError(err instanceof Error ? err.message : 'Error cargando profesores');
      setProfessors([]);
    }
  }

  async function loadStudents(tkn: string) {
    try {
      const students = await getJson<Array<{ id: string; name: string; email: string }>>('users/students', tkn);
      const names: Record<string, string> = {};
      
      students.forEach((student) => {
        names[student.id] = student.name;
      });
      
      setUserNames(names);
      setStudentsLoaded(true);
    } catch (err) {
      console.error('Error loading students:', err);
      setUserNames({});
    }
  }

  async function loadPractices(tkn: string) {
    setLoading(true);
    setError('');
    try {
      const response = await getJson<any>('practices', tkn);
      // API returns paginated response { data, total, page, limit, totalPages }
      const practices = response?.data || response || [];
      setPractices(Array.isArray(practices) ? practices : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading practices');
      setPractices([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications(tkn: string) {
    try {
      const path = isStudent ? `applications?userId=${encodeURIComponent(userId)}` : 'applications';
      const response = await getJson<any>(path, tkn);
      const applications = response?.data || response || [];
      let appsArray = Array.isArray(applications) ? applications : [];
      
      // For companies, filter to only show applications for their own practices
      if (isCompany) {
        const myPracticeIds = new Set(practices.map(p => p.id));
        appsArray = appsArray.filter(app => myPracticeIds.has(app.practiceId));
      }
      
      setApplications(appsArray);
      await loadStudents(tkn);
    } catch (err) {
      console.error('Error loading applications:', err);
      setApplications([]);
    }
  }

  async function loadPlacements(tkn: string) {
    try {
      const response = await getJson<any>('placements', tkn);
      const data = response?.data || response || [];
      const placementsArray = Array.isArray(data) ? data : [];
      setPlacements(placementsArray);
      await loadStudents(tkn);
    } catch (err) {
      console.error('Error loading placements:', err);
      setPlacements([]);
    }
  }

  async function handleCreatePractice(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName || !description) {
      setError('Complete company name and description');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await postJson<Practice>('practices', {
        userId,
        companyName,
        companyLocation,
        description,
        totalHours,
      }, token);

      setSuccess('Practice created successfully');
      setCompanyName('');
      setDescription('');
      setCompanyLocation('');
      setTotalHours(240);
      
      await loadPractices(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating practice');
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(practiceId: string) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await postJson<Application>('applications', {
        practiceId,
        userId,
      }, token);

      setSuccess('Application submitted');
      await loadApplications(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error applying');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateApplicationStatus(appId: string, status: string) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patchJson<Application>(`applications/${appId}`, { status }, token);
      setSuccess(`Aplicación ${status === 'accepted' ? 'aceptada' : 'actualizada'}`);
      await loadApplications(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating application');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignProfessor(placementId: string) {
    const professorId = assignInput[placementId];
    if (!professorId) {
      setError('Enter the professor ID');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patchJson<Placement>(`placements/${placementId}/assign-professor`, { professorId }, token);
      setSuccess('Professor invited to supervise');
      await loadPlacements(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error assigning professor');
    } finally {
      setLoading(false);
    }
  }

  async function handleRespondAssignment(placementId: string, action: 'accept'|'decline') {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patchJson<Placement>(`placements/${placementId}/assignment`, { action }, token);
      setSuccess(action === 'accept' ? 'You have accepted the supervision' : 'You have declined the supervision');
      await loadPlacements(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error responding to invitation');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  function hasApplied(practiceId: string) {
    return (applications || []).some(app => app.practiceId === practiceId && (app as any).userId === userId);
  }

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <main>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <div>
            <h1>Practice Portal</h1>
            <p>Dashboard connected to the backend for managing practices and applications.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="pill">Role: {primaryRole}</span>
            <Link className="link" href="/hour-logs">Hour Logs</Link>
            <Link className="link" href="/certificates">Certificates</Link>
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

      <div className="card-grid">
        {/* Student view */}
        {isStudent && (
          <div className="card">
            <div className="section-title">
              <h2>Students</h2>
              <span className="badge">Apply to practices</span>
            </div>
            <p>Explore available practices and apply.</p>

            <div className="divider" />
            <h4>Available practices ({(practices || []).length})</h4>
            {loading && <p className="small">Loading...</p>}
            {(practices || []).length === 0 && !loading && <p className="small">No available practices.</p>}
            <div style={{ display: 'grid', gap: 10 }}>
              {(practices || []).map((practice) => (
                <div key={practice.id} className="pill" style={{ justifyContent: 'space-between', width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ width: '100%' }}>
                    <strong>{practice.companyName}</strong>
                    <span className="small" style={{ marginLeft: 6 }}>- {practice.totalHours}h</span>
                  </div>
                  <p className="small" style={{ margin: '4px 0' }}>{practice.description}</p>
                  {practice.companyLocation && (
                    <span className="small" style={{ opacity: 0.7 }}>📍 {practice.companyLocation}</span>
                  )}
                  <div style={{ marginTop: 8, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge">{practice.validationStatus}</span>
                    {hasApplied(practice.id) ? (
                      <span className="small" style={{ color: 'var(--accent)' }}>✓ Applied</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => handleApply(practice.id)}
                        disabled={loading}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            <h4>My applications ({(applications || []).filter(a => (a as any).userId === userId).length})</h4>
            {(applications || []).filter(a => (a as any).userId === userId).map((app) => {
              const practice = (practices || []).find(p => p.id === app.practiceId);
              return (
                <div key={app.id} className="pill" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{practice?.companyName || 'Practice'}</strong>
                    <span className="small" style={{ marginLeft: 8 }}>Status: {app.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Company/Admin view (exclude professors) */}
        {(isAdmin || isCompany) && (
          <div className="card">
            <div className="section-title">
              <h2>Practice Management</h2>
              <span className="badge">Create and manage</span>
            </div>
            <p>Create new practice opportunities and manage applications.</p>

            <form onSubmit={handleCreatePractice} style={{ display: 'grid', gap: 10 }}>
              <label className="label">Company Name</label>
              <input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder="Tech Corp" 
                required
              />
              
              <label className="label">Description</label>
              <textarea 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Practice description, responsibilities, requirements..."
                required
              />
              
              <label className="label">Location (optional)</label>
              <input 
                value={companyLocation} 
                onChange={(e) => setCompanyLocation(e.target.value)} 
                placeholder="Remote / City" 
              />
              
              <label className="label">Total Hours</label>
              <input 
                type="number" 
                min={1} 
                value={totalHours} 
                onChange={(e) => setTotalHours(Number(e.target.value) || 240)} 
              />
              
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Practice'}
              </button>
            </form>

            <div className="divider" />
            <h4>Received Applications ({(applications || []).length})</h4>
            {(applications || []).length === 0 && <p className="small">No applications yet.</p>}
            {(applications || []).map((app) => {
              const practice = (practices || []).find(p => p.id === app.practiceId);
              return (
                <div key={app.id} className="flex-between" style={{ marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <div>
                    <strong>Student: {getUserLabel((app as any).userId)}</strong>
                    <p className="small" style={{ margin: '4px 0' }}>
                      Practice: {getPracticeName(app.practiceId)}
                    </p>
                    <span className="badge">{app.status}</span>
                  </div>
                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                        disabled={loading}
                      >
                        Accept
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        disabled={loading}
                        style={{ background: 'rgba(255,100,100,0.2)' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="divider" />
            <h4>Assign Professor</h4>
            {(placements || []).length === 0 && <p className="small">No placements to assign.</p>}
            <div style={{ display: 'grid', gap: 10 }}>
              {(placements || []).map((pl) => (
                <div key={pl.id} className="pill" style={{ width: '100%', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Placement</strong>
                    <span className="badge">{pl.assignmentStatus || 'pending'}</span>
                  </div>
                  <p className="small" style={{ margin: '4px 0' }}>Estudiante: {getUserLabel(pl.studentId || pl.student?.id || '')} • Práctica: {getPracticeName(pl.practiceId || pl.practice?.id || '')}</p>
                  {professorsError && <p className="small" style={{ color: '#ff8a8a', margin: '4px 0' }}>{professorsError}</p>}
                  <div style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={assignInput[pl.id] || ''}
                      onChange={(e) => setAssignInput({ ...assignInput, [pl.id]: e.target.value })}
                      style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="">Select a professor...</option>
                      {professors.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleAssignProfessor(pl.id)} disabled={loading || !(assignInput[pl.id] || '').length}>
                      Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professor view */}
        {isProfessor && (
          <div className="card">
            <div className="section-title">
              <h2>Professors</h2>
              <span className="badge">Academic Tutor</span>
            </div>
            <p>Supervises practices and validates hours from the <Link className="link" href="/hour-logs">Hour Logs</Link> module.</p>

            <div className="divider" />
            <h4>Supervision Invitations</h4>
            {(placements || []).filter(pl => (pl.assignmentStatus === 'invited')).length === 0 && (
              <p className="small">No pending invitations.</p>
            )}
            <div style={{ display: 'grid', gap: 10 }}>
              {(placements || []).filter(pl => pl.assignmentStatus === 'invited').map(pl => (
                <div key={pl.id} className="pill" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Student: {getUserLabel(pl.studentId || pl.student?.id || '')}</strong>
                    <span className="small" style={{ marginLeft: 8 }}>Practice: {getPracticeName(pl.practiceId || pl.practice?.id || '')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => handleRespondAssignment(pl.id, 'accept')} disabled={loading}>Accept</button>
                    <button type="button" onClick={() => handleRespondAssignment(pl.id, 'decline')} disabled={loading} style={{ background: 'rgba(255,100,100,0.2)' }}>Decline</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            <h4>Assigned Practices</h4>
            {(placements || []).filter(pl => pl.assignmentStatus === 'accepted').length === 0 && (
              <p className="small">No assignments yet.</p>
            )}
            <Link href="/hour-logs">
              <button type="button" style={{ width: '100%' }}>
                Go to Hour Logs →
              </button>
            </Link>
          </div>
        )}
      </div>

      {roles.length === 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3>Assign a Role</h3>
          <p className="small">Log in to load your role from the token.</p>
        </div>
      )}
    </main>
  );
}
