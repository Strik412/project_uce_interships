"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { postJson, resolveToken, API_BASE_URL } from '../../lib/api';
import { saveToken, clearToken } from '../../lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    clearToken();

    try {
      const payload = await postJson<Record<string, unknown>>('auth/login', { email, password });
      const token = resolveToken(payload);
      if (token) {
        saveToken(token);
        setStatus('Inicio de sesion exitoso. Redirigiendo al dashboard...');
        router.push('/dashboard');
      } else {
        setStatus('Login exitoso pero no se recibio token.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : String(error) || 'Error al iniciar sesion';
      setStatus(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="section-title">
          <h1>Ingresar</h1>
          <span className="badge">API: {API_BASE_URL}</span>
        </div>
        <p>Autenticate para acceder al portal. El token se guarda en el navegador.</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label className="label" htmlFor="email">Correo institucional</label>
          <input
            id="email"
            type="email"
            required
            placeholder="usuario@universidad.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label" htmlFor="password">Contrasena</label>
          <input
            id="password"
            type="password"
            required
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>
        {status && <p style={{ marginTop: 12 }}>{status}</p>}
        <div className="divider" />
        <p className="small">Necesitas una cuenta? <Link className="link" href="/register">Crear cuenta</Link></p>
        <p className="small">Ir al <Link className="link" href="/dashboard">dashboard</Link></p>
      </div>
    </main>
  );
}
