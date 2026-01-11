"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadToken } from '../lib/storage';
import { getRolesFromToken } from '../lib/auth';

export default function LandingPage() {
  const [hasSession, setHasSession] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = loadToken();
    setHasSession(Boolean(token));
    setRoles(getRolesFromToken(token));
  }, []);

  return (
    <main>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="section-title" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="badge">Portal de Practicas</span>
            <h1 style={{ margin: 0 }}>Centraliza registro, seguimiento y certificacion</h1>
            <p style={{ maxWidth: 640 }}>
              Gestiona cuentas de estudiantes, empresas y profesores desde un solo lugar. Las acciones del tablero viven ahora en
              /dashboard, y esta pagina es tu punto de entrada siempre visible.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="button" href="/login">Ingresar</Link>
              <Link className="button ghost" href="/register">Crear cuenta</Link>
            </div>
            {hasSession && (
              <div className="pill" style={{ width: 'fit-content' }}>
                Sesion detectada ({roles[0] ?? 'rol pendiente'}). Ir al <Link className="link" href="/dashboard" style={{ marginLeft: 6 }}>dashboard</Link>.
              </div>
            )}
          </div>
          <div className="card" style={{ maxWidth: 360, marginTop: 6 }}>
            <h3>Flujo rapido</h3>
            <ol className="small" style={{ paddingLeft: 18, margin: '8px 0 0', display: 'grid', gap: 6 }}>
              <li>Elige Ingresar o Crear cuenta.</li>
              <li>Tras login te enviamos directo al dashboard.</li>
              <li>Tras registro te redirigimos al login para validar.</li>
            </ol>
            <p className="small" style={{ marginTop: 10 }}>Necesitas ver roles? Usa la tarjeta superior con el token decodificado.</p>
          </div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="section-title">
            <h3>Para estudiantes</h3>
            <span className="badge">Postula y registra</span>
          </div>
          <p className="small">Aplica a vacantes, carga tus horas semanales y sigue tu avance desde el dashboard.</p>
        </div>
        <div className="card">
          <div className="section-title">
            <h3>Para empresas</h3>
            <span className="badge">Vacantes y feedback</span>
          </div>
          <p className="small">Crea oportunidades, revisa postulaciones y deja observaciones sobre el desempeno.</p>
        </div>
        <div className="card">
          <div className="section-title">
            <h3>Para profesores</h3>
            <span className="badge">Validacion</span>
          </div>
          <p className="small">Revisa y valida horas para habilitar certificados cuando todo este aprobado.</p>
        </div>
      </div>
    </main>
  );
}
