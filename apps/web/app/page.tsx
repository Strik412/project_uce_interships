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
            <span className="badge">Internship Portal</span>
            <h1 style={{ margin: 0 }}>Centralize registration, tracking, and certification</h1>
            <p style={{ maxWidth: 640 }}>
              Manage student, company, and professor accounts from a single place. Dashboard actions now live in
              /dashboard, and this page is your always-visible entry point.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="button" href="/login">Sign In</Link>
              <Link className="button ghost" href="/register">Create Account</Link>
            </div>
            {hasSession && (
              <div className="pill" style={{ width: 'fit-content' }}>
                Session detected ({roles[0] ?? 'pending role'}). Go to <Link className="link" href="/dashboard" style={{ marginLeft: 6 }}>dashboard</Link>.
              </div>
            )}
          </div>
          <div className="card" style={{ maxWidth: 360, marginTop: 6 }}>
            <h3>Quick Flow</h3>
            <ol className="small" style={{ paddingLeft: 18, margin: '8px 0 0', display: 'grid', gap: 6 }}>
              <li>Choose Sign In or Create Account.</li>
              <li>After login, you are sent directly to the dashboard.</li>
              <li>After registration, you are redirected to login for validation.</li>
            </ol>
            <p className="small" style={{ marginTop: 10 }}>Need to see roles? Use the top card with the decoded token.</p>
          </div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="section-title">
            <h3>For Students</h3>
            <span className="badge">Apply and Register</span>
          </div>
          <p className="small">Apply to openings, log your weekly hours, and track your progress from the dashboard.</p>
        </div>
        <div className="card">
          <div className="section-title">
            <h3>For Companies</h3>
            <span className="badge">Openings and Feedback</span>
          </div>
          <p className="small">Create opportunities, review applications, and leave feedback on performance.</p>
        </div>
        <div className="card">
          <div className="section-title">
            <h3>For Professors</h3>
            <span className="badge">Validation and Certificates</span>
          </div>
          <p className="small">Review and validate hours to enable certificates once everything is approved.</p>
        </div>
      </div>
    </main>
  );
}
