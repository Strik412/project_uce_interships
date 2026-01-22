"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJson } from '../../lib/api';
import { loadToken, clearToken } from '../../lib/storage';
import { isTokenExpired } from '../../lib/auth';

type DirectoryUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[];
  isActive: boolean;
  faculty?: string;
  career?: string;
  semester?: string;
  organization?: string;
  title?: string;
  about?: string;
  officeHours?: string;
  officeLocation?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyContact?: string;
  phoneNumber?: string;
  altEmail?: string;
  profileImage?: string;
  updatedAt?: string;
};

type DirectoryResponse = {
  data: DirectoryUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'student', label: 'Student' },
  { value: 'professor', label: 'Professor' },
  { value: 'company', label: 'Company' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Admin' },
];

export default function DirectoryPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [items, setItems] = useState<DirectoryUser[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const stored = loadToken();
    if (!stored) {
      setStatus('Necesitas iniciar sesión para ver el directorio.');
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
  }, [router]);

  useEffect(() => {
    if (!token) return;
    void fetchDirectory(page, role, search, token);
  }, [token, page, role, search]);

  async function fetchDirectory(targetPage: number, targetRole: string, term: string, authToken: string) {
    setLoading(true);
    setStatus('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(targetPage));
      params.set('limit', String(limit));
      if (targetRole) params.set('role', targetRole);
      if (term) params.set('search', term);
      const res = await getJson<DirectoryResponse>(`users/directory?${params.toString()}`, authToken);
      setItems(res.data);
      setTotalPages(res.totalPages || 1);
      if (res.total === 0) {
        setStatus('No se encontraron perfiles con esos filtros.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar directorio';
      setStatus(`No se pudo cargar el directorio: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  function fullName(u: DirectoryUser) {
    const fn = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return fn || 'Sin nombre';
  }

  const roleLabel = (u: DirectoryUser) => (u.roles && u.roles.length ? u.roles[0] : 'sin-rol');

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < totalPages, [page, totalPages]);

  return (
    <main>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1>Directorio</h1>
            <p>Explora perfiles públicos de estudiantes, profesores y empresas.</p>
          </div>
          <Link className="button ghost" href="/dashboard">Regresar al dashboard</Link>
        </div>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gap: 12, gridTemplateColumns: '2fr 1fr auto', alignItems: 'center' }}>
          <div>
            <label className="label" htmlFor="search">Buscar</label>
            <input
              id="search"
              placeholder="Nombre, correo, organización"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="role">Rol</label>
            <select id="role" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button type="submit" disabled={loading}>Filtrar</button>
          </div>
        </form>
        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </div>

      <div className="card-grid">
        {items.map((user) => (
          <div key={user.id} className="card" style={{ display: 'grid', gap: 8 }}>
            <div className="section-title">
              <div>
                <h3 style={{ marginBottom: 6 }}>{fullName(user)}</h3>
                <p style={{ marginBottom: 0 }}>{user.email}</p>
              </div>
              <span className="pill">Rol: {roleLabel(user)}</span>
            </div>
            {user.organization && <p><strong>Organización:</strong> {user.organization}</p>}
            {user.faculty && <p><strong>Facultad:</strong> {user.faculty}</p>}
            {user.career && <p><strong>Carrera:</strong> {user.career}</p>}
            {user.semester && <p><strong>Semestre:</strong> {user.semester}</p>}
            {user.title && <p><strong>Título:</strong> {user.title}</p>}
            {user.officeHours && <p><strong>Horario:</strong> {user.officeHours}</p>}
            {user.officeLocation && <p><strong>Ubicación:</strong> {user.officeLocation}</p>}
            {user.companyDescription && <p><strong>Empresa:</strong> {user.companyDescription}</p>}
            {user.companyWebsite && <p><strong>Sitio:</strong> {user.companyWebsite}</p>}
            {user.companyContact && <p><strong>Contacto:</strong> {user.companyContact}</p>}
            {user.phoneNumber && <p><strong>Teléfono:</strong> {user.phoneNumber}</p>}
            {user.altEmail && <p><strong>Correo alterno:</strong> {user.altEmail}</p>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Página {page} de {totalPages}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" disabled={!canPrev || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          <button type="button" disabled={!canNext || loading} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
        </div>
      </div>
    </main>
  );
}
