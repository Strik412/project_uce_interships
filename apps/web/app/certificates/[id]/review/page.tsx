"use client";

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadToken, clearToken } from '../../../../lib/storage';
import { getRolesFromToken, isTokenExpired } from '../../../../lib/auth';
import { getJson, patchJson } from '../../../../lib/api';
import type { Certificate } from '../../../../lib/api';

export default function CertificateReviewPage() {
  const router = useRouter();
  const params = useParams();
  const certificateId = params?.id as string;

  const [token, setToken] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const primaryRole = roles[0] ?? 'guest';
  const isProfessor = primaryRole === 'professor';

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
    if (!token || !certificateId) return;
    loadCertificate();
  }, [token, certificateId]);

  async function loadCertificate() {
    setLoading(true);
    setError('');
    try {
      const data = await getJson<Certificate>(`/certificates/${certificateId}`, token);
      setCertificate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading certificate');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!certificate) return;
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await patchJson(
        `/certificates/${certificate.id}/approve`,
        { comments },
        token
      );
      setSuccess('Certificate approved successfully!');
      setTimeout(() => {
        router.push('/certificates' as any);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving certificate');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!certificate || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await patchJson(
        `/certificates/${certificate.id}/reject`,
        { reason: rejectionReason },
        token
      );
      setSuccess('Certificate rejected successfully');
      setTimeout(() => {
        router.push('/certificates' as any);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting certificate');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isProfessor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only professors can review certificates.</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Certificate</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and approve or reject student certificate
            </p>
          </div>
          <Link
            href={'/certificates' as any}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Certificates
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

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
            <p className="mt-4 text-gray-600">Loading certificate...</p>
          </div>
        )}

        {/* Certificate Details */}
        {!loading && certificate && (
          <div className="bg-white rounded-lg shadow-lg">
            {/* Certificate Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Certificate Details</h2>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  {certificate.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Certificate Number</p>
                  <p className="font-medium text-gray-900">{certificate.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Issue Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(certificate.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Student Name</p>
                  <p className="font-medium text-gray-900">{certificate.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Professor Name</p>
                  <p className="font-medium text-gray-900">{certificate.professorName}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Practice Name</p>
                  <p className="font-medium text-gray-900">{certificate.practiceName}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Hours</p>
                  <p className="font-medium text-gray-900">{certificate.totalHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(certificate.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">End Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(certificate.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Form */}
            {certificate.status === 'PENDING' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>

                {/* Approval Section */}
                <div className="mb-6">
                  <label
                    htmlFor="comments"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Approval Comments (Optional)
                  </label>
                  <textarea
                    id="comments"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any comments about the approval..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full mb-4 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : '✓ Approve Certificate'}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Rejection Section */}
                <div className="mb-6">
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Please provide a detailed reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>

                <button
                  onClick={handleReject}
                  disabled={submitting || !rejectionReason.trim()}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : '✗ Reject Certificate'}
                </button>
              </div>
            )}

            {/* Already Reviewed */}
            {certificate.status !== 'PENDING' && (
              <div className="p-6">
                <div className="text-center py-6">
                  <p className="text-gray-600">
                    This certificate has already been reviewed and marked as{' '}
                    <strong>{certificate.status}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
