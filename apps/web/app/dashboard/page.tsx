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
      setError(err instanceof Error ? err.message : 'Error cargando prácticas');
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
      setError('Completa nombre de empresa y descripción');
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

      setSuccess('Práctica creada exitosamente');
      setCompanyName('');
      setDescription('');
      setCompanyLocation('');
      setTotalHours(240);
      
      await loadPractices(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando práctica');
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

      setSuccess('Postulación enviada');
      await loadApplications(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al postular');
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
      setError(err instanceof Error ? err.message : 'Error actualizando aplicación');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignProfessor(placementId: string) {
    const professorId = assignInput[placementId];
    if (!professorId) {
      setError('Ingresa el ID del profesor');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patchJson<Placement>(`placements/${placementId}/assign-professor`, { professorId }, token);
      setSuccess('Profesor invitado para supervisar');
      await loadPlacements(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error asignando profesor');
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
      setSuccess(action === 'accept' ? 'Has aceptado la supervisión' : 'Has declinado la supervisión');
      await loadPlacements(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error respondiendo invitación');
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
            <h1>Portal de Prácticas</h1>
            <p>Dashboard conectado al backend para gestión de prácticas y aplicaciones.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="pill">Rol: {primaryRole}</span>
            <Link className="link" href="/hour-logs">Registro de Horas</Link>
            <Link className="link" href="/certificates">Certificados</Link>
            <Link className="link" href="/profile">Perfil</Link>
            <button onClick={handleLogout}>Cerrar sesión</button>
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
              <h2>Estudiantes</h2>
              <span className="badge">Postula a prácticas</span>
            </div>
            <p>Explora prácticas disponibles y postula.</p>

            <div className="divider" />
            <h4>Prácticas disponibles ({(practices || []).length})</h4>
            {loading && <p className="small">Cargando...</p>}
            {(practices || []).length === 0 && !loading && <p className="small">No hay prácticas disponibles.</p>}
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
                      <span className="small" style={{ color: 'var(--accent)' }}>✓ Ya postulaste</span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => handleApply(practice.id)}
                        disabled={loading}
                      >
                        Postular
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            <h4>Mis aplicaciones ({(applications || []).filter(a => (a as any).userId === userId).length})</h4>
            {(applications || []).filter(a => (a as any).userId === userId).map((app) => {
              const practice = (practices || []).find(p => p.id === app.practiceId);
              return (
                <div key={app.id} className="pill" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{practice?.companyName || 'Práctica'}</strong>
                    <span className="small" style={{ marginLeft: 8 }}>Estado: {app.status}</span>
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
              <h2>Gestión de Prácticas</h2>
              <span className="badge">Crear y administrar</span>
            </div>
            <p>Crea nuevas oportunidades de práctica y gestiona aplicaciones.</p>

            <form onSubmit={handleCreatePractice} style={{ display: 'grid', gap: 10 }}>
              <label className="label">Nombre de la empresa</label>
              <input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder="Tech Corp" 
                required
              />
              
              <label className="label">Descripción</label>
              <textarea 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Descripción de la práctica, responsabilidades, requisitos..."
                required
              />
              
              <label className="label">Ubicación (opcional)</label>
              <input 
                value={companyLocation} 
                onChange={(e) => setCompanyLocation(e.target.value)} 
                placeholder="Remoto / Ciudad" 
              />
              
              <label className="label">Horas totales</label>
              <input 
                type="number" 
                min={1} 
                value={totalHours} 
                onChange={(e) => setTotalHours(Number(e.target.value) || 240)} 
              />
              
              <button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear práctica'}
              </button>
            </form>

            <div className="divider" />
            <h4>Aplicaciones recibidas ({(applications || []).length})</h4>
            {(applications || []).length === 0 && <p className="small">Sin aplicaciones aún.</p>}
            {(applications || []).map((app) => {
              const practice = (practices || []).find(p => p.id === app.practiceId);
              return (
                <div key={app.id} className="flex-between" style={{ marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <div>
                    <strong>Estudiante: {getUserLabel((app as any).userId)}</strong>
                    <p className="small" style={{ margin: '4px 0' }}>
                      Práctica: {getPracticeName(app.practiceId)}
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
                        Aceptar
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        disabled={loading}
                        style={{ background: 'rgba(255,100,100,0.2)' }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="divider" />
            <h4>Asignar profesor</h4>
            {(placements || []).length === 0 && <p className="small">No hay colocaciones para asignar.</p>}
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
                      <option value="">Selecciona un profesor...</option>
                      {professors.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleAssignProfessor(pl.id)} disabled={loading || !(assignInput[pl.id] || '').length}>
                      Invitar
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
              <h2>Profesores</h2>
              <span className="badge">Tutor académico</span>
            </div>
            <p>Supervisa prácticas y valida horas desde el módulo de <Link className="link" href="/hour-logs">Registro de Horas</Link>.</p>

            <div className="divider" />
            <h4>Invitaciones de supervisión</h4>
            {(placements || []).filter(pl => (pl.assignmentStatus === 'invited')).length === 0 && (
              <p className="small">No tienes invitaciones pendientes.</p>
            )}
            <div style={{ display: 'grid', gap: 10 }}>
              {(placements || []).filter(pl => pl.assignmentStatus === 'invited').map(pl => (
                <div key={pl.id} className="pill" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Estudiante: {getUserLabel(pl.studentId || pl.student?.id || '')}</strong>
                    <span className="small" style={{ marginLeft: 8 }}>Práctica: {getPracticeName(pl.practiceId || pl.practice?.id || '')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => handleRespondAssignment(pl.id, 'accept')} disabled={loading}>Aceptar</button>
                    <button type="button" onClick={() => handleRespondAssignment(pl.id, 'decline')} disabled={loading} style={{ background: 'rgba(255,100,100,0.2)' }}>Declinar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            <h4>Prácticas asignadas</h4>
            {(placements || []).filter(pl => pl.assignmentStatus === 'accepted').length === 0 && (
              <p className="small">Sin asignaciones aún.</p>
            )}
            <Link href="/hour-logs">
              <button type="button" style={{ width: '100%' }}>
                Ir a Registro de Horas →
              </button>
            </Link>
          </div>
        )}
      </div>

      {roles.length === 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3>Asigna un rol</h3>
          <p className="small">Inicia sesión para cargar tu rol desde el token.</p>
        </div>
      )}
    </main>
  );
}
