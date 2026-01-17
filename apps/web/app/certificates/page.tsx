"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadToken, clearToken } from '../../lib/storage';
import { getRolesFromToken, isTokenExpired } from '../../lib/auth';
import { getJson } from '../../lib/api';
import type { Certificate } from '../../lib/api';

export default function CertificatesPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setCertificates(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading certificates');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(certId: string) {
    // Open in new tab or trigger download
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1'}/certificates/${certId}/download`;
    window.open(downloadUrl, '_blank');
  }

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REVOKED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isStudent ? 'My Certificates' : isProfessor ? 'Certificate Approvals' : 'Certificates Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isStudent
                ? 'View and download your internship completion certificates'
                : 'Review and approve student certificates'}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading certificates...</p>
          </div>
        )}

        {/* Certificates List */}
        {!loading && certificates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isStudent
                ? 'Your certificates will appear here once your internship is completed and approved.'
                : 'No pending certificates to review at this time.'}
            </p>
          </div>
        )}

        {!loading && certificates.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* Certificate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {cert.practiceName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Certificate #{cert.certificateNumber}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                      cert.status
                    )}`}
                  >
                    {cert.status}
                  </span>
                </div>

                {/* Certificate Details */}
                <div className="space-y-2 text-sm mb-4">
                  {isStudent && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Student:</span>
                        <span className="font-medium text-gray-900">{cert.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Professor:</span>
                        <span className="font-medium text-gray-900">{cert.professorName}</span>
                      </div>
                    </>
                  )}
                  {isProfessor && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Student:</span>
                      <span className="font-medium text-gray-900">{cert.studentName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hours Completed:</span>
                    <span className="font-medium text-gray-900">{cert.totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Period:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(cert.startDate).toLocaleDateString()} -{' '}
                      {new Date(cert.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Issue Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Approval/Rejection Info */}
                {cert.status === 'APPROVED' && cert.approvedAt && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-800">
                      <strong>Approved:</strong>{' '}
                      {new Date(cert.approvedAt).toLocaleDateString()}
                    </p>
                    {cert.approvalComments && (
                      <p className="text-xs text-green-700 mt-1">{cert.approvalComments}</p>
                    )}
                  </div>
                )}

                {cert.status === 'REJECTED' && cert.rejectedAt && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-800">
                      <strong>Rejected:</strong>{' '}
                      {new Date(cert.rejectedAt).toLocaleDateString()}
                    </p>
                    {cert.rejectionReason && (
                      <p className="text-xs text-red-700 mt-1">{cert.rejectionReason}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isStudent && cert.status === 'APPROVED' && (
                    <button
                      onClick={() => handleDownload(cert.id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Download PDF
                    </button>
                  )}

                  {isProfessor && cert.status === 'PENDING' && (
                    <>
                      <Link
                        href={`/certificates/${cert.id}/review` as any}
                        className="flex-1 px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Review
                      </Link>
                    </>
                  )}

                  {isStudent && cert.status === 'PENDING' && (
                    <div className="flex-1 text-center text-sm text-gray-500 py-2">
                      Awaiting approval
                    </div>
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
