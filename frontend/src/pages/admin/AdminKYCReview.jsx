import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { kycAPI } from '../../api';
import { Link } from 'react-router-dom';

const AdminKYCReview = () => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [kycDetails, setKycDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchPendingApplications();
    fetchStats();
  }, [page]);

  const fetchPendingApplications = async () => {
    setLoading(true);
    try {
      const response = await kycAPI.getPendingKyc(page, 10);
      setPendingApplications(response.data.applications);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch pending applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await kycAPI.getKycStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchKycDetails = async (userId) => {
    setLoading(true);
    try {
      const response = await kycAPI.getKycDetails(userId);
      setKycDetails(response.data);
      setSelectedUser(userId);
    } catch (error) {
      toast.error('Failed to fetch KYC details');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action) => {
    const notes = prompt('Enter review notes (optional):');
    if (notes === null) return; // User cancelled

    let rejectionReason = null;
    if (action === 'reject') {
      rejectionReason = prompt('Enter rejection reason (required):');
      if (!rejectionReason) {
        toast.error('Rejection reason is required');
        return;
      }
    }

    setReviewLoading(true);
    try {
      await kycAPI.reviewKyc(selectedUser, action, notes || undefined, rejectionReason);

      toast.success(`KYC ${action}d successfully!`);
      setSelectedUser(null);
      setKycDetails(null);
      fetchPendingApplications();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || `Failed to ${action} KYC`);
    } finally {
      setReviewLoading(false);
    }
  };

  const documentTypeLabels = {
    passport: '🛂 Passport',
    drivers_license: '🪪 Driver\'s License',
    national_id: '🆔 National ID',
    utility_bill: '📄 Utility Bill',
    bank_statement: '🏦 Bank Statement',
    selfie: '🤳 Selfie'
  };

  if (selectedUser && kycDetails) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => {
              setSelectedUser(null);
              setKycDetails(null);
            }}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center font-semibold"
          >
            ← Back to Applications
          </button>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  KYC Review: {kycDetails.user.username}
                </h2>
                <p className="text-gray-300">{kycDetails.user.email}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Submitted: {new Date(kycDetails.user.kycSubmittedAt).toLocaleString()}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold ${
                kycDetails.user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                kycDetails.user.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {kycDetails.user.kycStatus.toUpperCase()}
              </div>
            </div>

            {kycDetails.user.kycAiVerificationScore && (
              <div className="mb-6 backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <p className="font-semibold text-blue-300">
                  AI Verification Score: {kycDetails.user.kycAiVerificationScore}/100
                </p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Submitted Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kycDetails.documents.length === 0 ? (
                  <div className="col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-300 font-semibold text-lg">No KYC Documents Uploaded</p>
                    <p className="text-gray-400 text-sm mt-2">This user has not submitted any identity verification documents yet.</p>
                  </div>
                ) : kycDetails.documents.map((doc) => (
                  <div key={doc._id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white">
                          {documentTypeLabels[doc.documentType] || doc.documentType}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Size: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        doc.adminReviewStatus === 'pending' ? 'backdrop-blur-xl bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                        doc.adminReviewStatus === 'approved' ? 'backdrop-blur-xl bg-green-500/20 text-green-300 border border-green-400/30' :
                        'backdrop-blur-xl bg-red-500/20 text-red-300 border border-red-400/30'
                      }`}>
                        {doc.adminReviewStatus}
                      </span>
                    </div>

                    {doc.mimeType.startsWith('image/') ? (
                      <div className="mb-3">
                        <img
                          src={doc.fileUrl}
                          alt={doc.documentType}
                          className="w-full h-64 object-contain bg-gray-100 rounded cursor-pointer hover:opacity-90"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        />
                      </div>
                    ) : (
                      <div className="mb-3 backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm font-medium text-white">{doc.fileName}</p>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block"
                        >
                          Open PDF →
                        </a>
                      </div>
                    )}

                    <div className="text-xs text-gray-400">
                      <p>Uploaded: {new Date(doc.createdAt).toLocaleString()}</p>
                      {doc.adminReviewNotes && (
                        <p className="mt-1 text-gray-300">Notes: {doc.adminReviewNotes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {kycDetails.user.kycStatus === 'pending' && (
              <div className="flex gap-4 border-t pt-6">
                <button
                  onClick={() => handleReview('reject')}
                  disabled={reviewLoading}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                >
                  {reviewLoading ? 'Processing...' : 'Reject KYC'}
                </button>
                <button
                  onClick={() => handleReview('approve')}
                  disabled={reviewLoading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {reviewLoading ? 'Processing...' : 'Approve KYC'}
                </button>
              </div>
            )}

            {kycDetails.user.kycStatus === 'rejected' && kycDetails.user.kycRejectionReason && (
              <div className="border-t border-white/10 pt-6">
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                  <p className="font-semibold text-red-300 mb-2">Rejection Reason:</p>
                  <p className="text-red-200">{kycDetails.user.kycRejectionReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">KYC Review Dashboard</h1>
          <p className="text-gray-300">Review and approve user identity verification documents</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {stats.statusBreakdown.pending || 0}
                  </p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-400">
                    {stats.statusBreakdown.approved || 0}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-400">
                    {stats.statusBreakdown.rejected || 0}
                  </p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Last 30 Days</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.recentActivity.submissionsLast30Days}
                  </p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Pending Applications</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading applications...</p>
            </div>
          ) : pendingApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-300 font-semibold text-lg">No Pending KYC Applications</p>
              <p className="text-gray-400 text-sm mt-2">All applications have been reviewed</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="backdrop-blur-sm bg-white/5 border-b border-white/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="backdrop-blur-sm bg-white/5 divide-y divide-white/20">
                    {pendingApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-white/10 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-white">{app.username}</div>
                            <div className="text-sm text-gray-400">{app.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(app.kycSubmittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="font-medium text-white">{app.totalDocuments}</span> documents
                            {app.verifiedDocuments > 0 && (
                              <span className="text-green-400 ml-2">
                                ({app.verifiedDocuments} verified)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {app.kycAiVerificationScore ? (
                            <span className="px-2 py-1 text-xs rounded-full backdrop-blur-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                              AI Score: {app.kycAiVerificationScore}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full backdrop-blur-xl bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                              Manual Review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => fetchKycDetails(app._id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-white/20 flex items-center justify-between">
                  <div className="text-sm text-gray-300">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKYCReview;
