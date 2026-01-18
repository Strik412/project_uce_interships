"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadToken, clearToken } from '../../lib/storage';
import { getRolesFromToken, isTokenExpired } from '../../lib/auth';
import { getJson, postJson } from '../../lib/api';
import type { Certificate, Placement } from '../../lib/api';

export default function CertificatesPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const primaryRole = roles[0] ?? 'guest';
  const isStudent = primaryRole === 'student';
  const isProfessor = primaryRole === 'professor';
  const isAdmin = primaryRole === 'admin' || primaryRole === 'coordinator';

  useEffect(() => {
    const stored = loadToken();
    if (!stored || isTokenExpired(stored)) {
      clearToken();
      router.push('/login');
      return;
    }
    setToken(stored);
    setRoles(getRolesFromToken(stored));
  }, [router]);

  useEffect(() => {
    if (!token) return;
    loadCertificates();
    if (isStudent) {
      loadPlacements();
    }
    console.log('DEBUG: Certificates page loaded - primaryRole:', primaryRole, 'isStudent:', isStudent, 'isProfessor:', isProfessor, 'isAdmin:', isAdmin);
  }, [token, primaryRole]);

  async function loadCertificates() {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      
      if (isStudent) {
        // Students see their own certificates
        endpoint = '/certificates/student/me';
      } else if (isProfessor) {
        // Professors see pending certificates for review
        endpoint = '/certificates/pending';
      } else if (isAdmin) {
        // Admins might see all certificates (implement as needed)
        endpoint = '/certificates/pending';
      }

      if (endpoint) {
        const data = await getJson<Certificate[]>(endpoint, token);
        console.log('DEBUG: Loaded certificates from', endpoint, '- Count:', data?.length, '- Data:', JSON.stringify(data));
        setCertificates(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading certificates');
    } finally {
      setLoading(false);
    }
  }

  async function loadPlacements() {
    try {
      const data = await getJson<Placement[]>('placements', token);
      setPlacements(data || []);
    } catch (err) {
      console.error('Error loading placements:', err);
    }
  }

  async function handleRequestCertificate(placementId: string) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await postJson<Certificate>(`certificates/request/${placementId}`, {}, token);
      setSuccess('Certificate requested successfully! Awaiting teacher approval.');
      await loadCertificates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error requesting certificate');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(certId: string) {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
      
      // Fetch the PDF with auth header
      const response = await fetch(`${apiUrl}/certificates/${certId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Certificate downloaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error downloading certificate');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  function getStatusBadgeColor(status: string) {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'APPROVED':
        return 'badge-approved';
      case 'PENDING':
        return 'badge-pending';
      case 'REJECTED':
        return 'badge-rejected';
      case 'REVOKED':
        return 'badge-revoked';
      default:
        return 'badge-revoked';
    }
  }

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div>
          <h1>{isStudent ? 'My Certificates' : isProfessor ? 'Certificate Approvals' : 'Certificates Management'}</h1>
          <p className="subtext">
            {isStudent
              ? 'View and download your internship completion certificates'
              : 'Review and approve student certificates'}
          </p>
        </div>
        <div className="top-actions">
          <Link href="/dashboard" className="button button-ghost">
            ← Back to Dashboard
          </Link>
          <button onClick={handleLogout} className="button button-danger">
            Logout
          </button>
        </div>
      </header>

      <main>
        {/* Error Display */}
        {error && (
          <div className="card error-card">
            <p>{error}</p>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="card success-card">
            <p>{success}</p>
          </div>
        )}

        {/* Request Certificate Section - Students Only */}
        {isStudent && placements.length > 0 && (
          <div className="card">
            <div className="section-title">
              <h2>Request Certificate</h2>
            </div>
            <p className="small">
              You can request a certificate for placements where all hours have been approved by both teacher and company.
            </p>
            <div className="card-stack">
              {placements
                .filter(p => {
                  const completed = typeof p.completedHours === 'string' ? parseFloat(p.completedHours) : p.completedHours;
                  const expected = p.expectedHours;
                  const hasExistingCert = certificates.some(c => c.placementId === p.id);
                  return completed >= expected && !hasExistingCert;
                })
                .map(placement => {
                  const completed = typeof placement.completedHours === 'string' ? parseFloat(placement.completedHours) : placement.completedHours;
                  return (
                    <div key={placement.id} className="card compact">
                      <div className="flex-between">
                        <div>
                          <p className="strong">{placement.practice?.companyName || placement.practiceId?.slice(0, 8) || 'N/A'}</p>
                          <p className="small">{completed}h / {placement.expectedHours}h completed</p>
                          <p className="micro">{new Date(placement.startDate).toLocaleDateString()} - {new Date(placement.endDate).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleRequestCertificate(placement.id)} disabled={loading}>
                          Request Certificate
                        </button>
                      </div>
                    </div>
                  );
                })}
              {placements.filter(p => {
                const completed = typeof p.completedHours === 'string' ? parseFloat(p.completedHours) : p.completedHours;
                const hasExistingCert = certificates.some(c => c.placementId === p.id);
                return completed >= p.expectedHours && !hasExistingCert;
              }).length === 0 && (
                <p className="small" style={{ textAlign: 'center', padding: '8px 0' }}>
                  No eligible placements for certificate request. Complete all required hours first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Loading certificates...</p>
          </div>
        )}

        {/* Certificates List */}
        {!loading && certificates.length === 0 && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>No certificates found</h3>
            <p className="small">
              {isStudent
                ? 'Your certificates will appear here once your internship is completed and approved.'
                : 'No pending certificates to review at this time.'}
            </p>
          </div>
        )}

        {!loading && certificates.length > 0 && (
          <div className="card-grid">
            {certificates.map((cert) => (
              <div key={cert.id} className="card certificate-card">
                <div className="card-top">
                  <div>
                    <p className="eyebrow">Certificate #{cert.certificateNumber}</p>
                    <h3>{cert.practiceName || 'Internship Program'}</h3>
                  </div>
                  <span className={`badge ${getStatusBadgeColor(cert.status)}`}>
                    {cert.status?.toUpperCase()}
                  </span>
                </div>

                <div className="meta">
                  {isStudent && (
                    <>
                      <div className="meta-row">
                        <span>Student</span>
                        <strong>{cert.studentName || 'N/A'}</strong>
                      </div>
                      <div className="meta-row">
                        <span>Professor</span>
                        <strong>{cert.professorName || 'N/A'}</strong>
                      </div>
                    </>
                  )}
                  {isProfessor && (
                    <div className="meta-row">
                      <span>Student</span>
                      <strong>{cert.studentName || 'N/A'}</strong>
                    </div>
                  )}
                  <div className="meta-row">
                    <span>Hours Completed</span>
                    <strong>{cert.totalHours || 'N/A'}h</strong>
                  </div>
                  <div className="meta-row">
                    <span>Period</span>
                    <strong>
                      {cert.startDate ? new Date(cert.startDate).toLocaleDateString() : 'N/A'} - {cert.endDate ? new Date(cert.endDate).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>
                  <div className="meta-row">
                    <span>Issue Date</span>
                    <strong>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                </div>

                {cert.status?.toUpperCase() === 'APPROVED' && cert.approvedAt && (
                  <div className="callout callout-success">
                    <p>
                      <strong>Approved:</strong> {new Date(cert.approvedAt).toLocaleDateString()}
                    </p>
                    {cert.approvalComments && <p className="micro">{cert.approvalComments}</p>}
                  </div>
                )}

                {cert.status?.toUpperCase() === 'REJECTED' && cert.rejectedAt && (
                  <div className="callout callout-danger">
                    <p>
                      <strong>Rejected:</strong> {new Date(cert.rejectedAt).toLocaleDateString()}
                    </p>
                    {cert.rejectionReason && <p className="micro">{cert.rejectionReason}</p>}
                  </div>
                )}

                <div className="actions">
                  {isStudent && cert.status?.toUpperCase() === 'APPROVED' && (
                    <button onClick={() => handleDownload(cert.id)}>Download PDF</button>
                  )}

                  {isProfessor && cert.status?.toUpperCase() === 'PENDING' && (
                    <Link href={`/certificates/${cert.id}/review` as any} className="button">
                      Review
                    </Link>
                  )}

                  {isStudent && cert.status?.toUpperCase() === 'PENDING' && (
                    <span className="small" style={{ textAlign: 'center', width: '100%' }}>
                      Awaiting approval
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
