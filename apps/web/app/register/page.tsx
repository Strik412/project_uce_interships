"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { postJson, API_BASE_URL } from '../../lib/api';

type Role = 'student' | 'company' | 'professor';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const roleCopy = useMemo(() => {
    if (role === 'company') return 'Company';
    if (role === 'professor') return 'Professor';
    return 'Student';
  }, [role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    const payload: Record<string, unknown> = {
      email,
      password,
      firstName,
      lastName,
      role,
    };

    if (role === 'company') {
      payload.companyName = companyName;
    }

    try {
      await postJson<Record<string, unknown>>('auth/register', payload);
      setStatus('Registration sent. Redirecting to login...');
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error) || 'Registration error';
      setStatus(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="section-title">
          <div>
            <h1>Create your account</h1>
            <p>Register a {roleCopy} profile to get started.</p>
          </div>
          <span className="badge">API: {API_BASE_URL}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div className="flex-between">
            <label className="label">Account Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['student', 'company', 'professor'] as Role[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  style={{
                    background: role === option ? 'linear-gradient(135deg, var(--accent), #8bf2f0)' : 'rgba(255,255,255,0.06)',
                    color: role === option ? '#04101a' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                  onClick={() => setRole(option)}
                >
                  {option === 'student' && 'Student'}
                  {option === 'company' && 'Company'}
                  {option === 'professor' && 'Professor'}
                </button>
              ))}
            </div>
          </div>

          <div className="card-grid">
            <div>
              <label className="label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                required
                placeholder="Ana"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                required
                placeholder="Rojas"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <label className="label" htmlFor="email">Institutional Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="user@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {role === 'company' && (
            <div>
              <label className="label" htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                placeholder="TechNova S.A."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Register'}
          </button>
        </form>

        {status && <p style={{ marginTop: 12 }}>{status}</p>}
        <div className="divider" />
        <p className="small">Already have an account? <Link className="link" href="/login">Log in</Link></p>
        <p className="small">Go to <Link className="link" href="/dashboard">dashboard</Link></p>
      </div>
    </main>
  );
}
