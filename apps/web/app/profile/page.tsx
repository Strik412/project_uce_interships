"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { loadToken, clearToken } from '../../lib/storage';
import { getRolesFromToken, isTokenExpired } from '../../lib/auth';
import { getJson, patchJson } from '../../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  // Shared contact fields
  const [phone, setPhone] = useState('');
  const [altEmail, setAltEmail] = useState('');

  // Student fields
  const [studentName, setStudentName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [career, setCareer] = useState('');
  const [semester, setSemester] = useState('');

  // Professor fields
  const [professorName, setProfessorName] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [officeNotes, setOfficeNotes] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyContact, setCompanyContact] = useState('');

  useEffect(() => {
    const stored = loadToken();
    if (!stored) {
      setStatus('Necesitas iniciar sesión para ver tu perfil.');
      router.push('/login');
      return;
    }
    if (isTokenExpired(stored)) {
      clearToken();
      setStatus('La sesión expiró. Inicia sesión nuevamente.');
      router.push('/login');
      return;
    }
    setToken(stored);
    setRoles(getRolesFromToken(stored));

    // Cargar perfil desde backend
    getJson<any>('users/me', stored)
      .then((profile) => {
        setPhone(profile.phoneNumber ?? '');
        setAltEmail(profile.altEmail ?? '');
        setStudentName(profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : '');
        setFaculty(profile.faculty ?? '');
        setCareer(profile.career ?? '');
        setSemester(profile.semester ?? '');
        setProfessorName(profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : '');
        setOfficeHours(profile.officeHours ?? '');
        setOfficeLocation(profile.officeLocation ?? '');
        setOfficeNotes(profile.officeNotes ?? '');
        setCompanyName(profile.organization ?? '');
        setCompanyDescription(profile.companyDescription ?? '');
        setCompanyWebsite(profile.companyWebsite ?? '');
        setCompanyContact(profile.companyContact ?? '');
      })
      .catch((error: Error) => {
        setStatus(`No se pudo cargar el perfil: ${error.message}`);
      });
  }, [router]);

  const primaryRole = useMemo(() => roles[0] ?? 'guest', [roles]);

  function handleLogout() {
    clearToken();
    setToken('');
    router.push('/login');
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setStatus('No hay sesión activa.');
      return;
    }

    const payload: Record<string, unknown> = {
      phoneNumber: phone || undefined,
      altEmail: altEmail || undefined,
    };

    if (isStudent) {
      payload.faculty = faculty || undefined;
      payload.career = career || undefined;
      payload.semester = semester || undefined;
    }

    if (isProfessor) {
      payload.officeHours = officeHours || undefined;
      payload.officeLocation = officeLocation || undefined;
      payload.officeNotes = officeNotes || undefined;
    }

    if (isCompany) {
      payload.organization = companyName || undefined;
      payload.companyDescription = companyDescription || undefined;
      payload.companyWebsite = companyWebsite || undefined;
      payload.companyContact = companyContact || undefined;
    }

    patchJson('users/me', payload, token)
      .then(() => {
        setStatus('Perfil actualizado.');
      })
      .catch((error: Error) => {
        setStatus(`No se pudo actualizar: ${error.message}`);
      });
  }

  const isStudent = roles.includes('student');
  const isProfessor = roles.includes('professor');
  const isCompany = roles.includes('company');

  return (
    <main>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <div>
            <h1>Perfil</h1>
            <p>Actualiza tu información de contacto y datos del rol.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="pill">Rol: {primaryRole}</span>
            <Link className="button ghost" href="/dashboard">Regresar al dashboard</Link>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
        {status && <p>{status}</p>}
      </div>

      <form className="card-grid" onSubmit={handleSave}>
        <div className="card">
          <div className="section-title">
            <h3>Contacto</h3>
            <span className="badge">Visible para coordinadores</span>
          </div>
          <label className="label" htmlFor="phone">Teléfono</label>
          <input id="phone" placeholder="099 999 9999" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label className="label" htmlFor="altEmail">Correo alterno</label>
          <input id="altEmail" type="email" placeholder="correo@personal.com" value={altEmail} onChange={(e) => setAltEmail(e.target.value)} />
        </div>

        {isStudent && (
          <div className="card">
            <div className="section-title">
              <h3>Datos de estudiante</h3>
              <span className="badge">Perfil académico</span>
            </div>
            <label className="label" htmlFor="studentName">Nombre completo</label>
            <input id="studentName" placeholder="Ana Rojas" value={studentName} onChange={(e) => setStudentName(e.target.value)} />

            <label className="label" htmlFor="faculty">Facultad</label>
            <input id="faculty" placeholder="Ingeniería" value={faculty} onChange={(e) => setFaculty(e.target.value)} />

            <label className="label" htmlFor="career">Carrera</label>
            <input id="career" placeholder="Software" value={career} onChange={(e) => setCareer(e.target.value)} />

            <label className="label" htmlFor="semester">Semestre</label>
            <input id="semester" placeholder="7" value={semester} onChange={(e) => setSemester(e.target.value)} />
          </div>
        )}

        {isProfessor && (
          <div className="card">
            <div className="section-title">
              <h3>Datos de profesor</h3>
              <span className="badge">Disponibilidad</span>
            </div>
            <label className="label" htmlFor="professorName">Nombre completo</label>
            <input id="professorName" placeholder="Carlos Rivera" value={professorName} onChange={(e) => setProfessorName(e.target.value)} />

            <label className="label" htmlFor="officeHours">Horario de atención</label>
            <input id="officeHours" placeholder="Lun y Mie 15h-17h" value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} />

            <label className="label" htmlFor="officeLocation">Ubicación de oficina</label>
            <input id="officeLocation" placeholder="Edificio B, oficina 204" value={officeLocation} onChange={(e) => setOfficeLocation(e.target.value)} />

            <label className="label" htmlFor="officeNotes">Notas adicionales</label>
            <textarea id="officeNotes" placeholder="Traer avances impresos" value={officeNotes} onChange={(e) => setOfficeNotes(e.target.value)} />
          </div>
        )}

        {isCompany && (
          <div className="card">
            <div className="section-title">
              <h3>Perfil de empresa</h3>
              <span className="badge">Datos públicos</span>
            </div>
            <label className="label" htmlFor="companyName">Nombre comercial</label>
            <input id="companyName" placeholder="TechLabs" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />

            <label className="label" htmlFor="companyDescription">Descripción</label>
            <textarea id="companyDescription" placeholder="Quiénes somos y qué buscamos" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} />

            <label className="label" htmlFor="companyWebsite">Sitio web</label>
            <input id="companyWebsite" placeholder="https://empresa.com" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />

            <label className="label" htmlFor="companyContact">Contacto directo</label>
            <input id="companyContact" placeholder="talento@empresa.com / +593 99 999 9999" value={companyContact} onChange={(e) => setCompanyContact(e.target.value)} />
          </div>
        )}

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="section-title">
            <h3>Acciones</h3>
            <span className="badge">Conectado</span>
          </div>
          <p className="small">Los cambios se guardan en tu perfil del User Management Service.</p>
          <button type="submit">Guardar cambios</button>
          <p className="small" style={{ marginTop: 8 }}>¿Necesitas eliminar cuenta? Añade la acción cuando el backend esté listo.</p>
        </div>
      </form>
    </main>
  );
}
