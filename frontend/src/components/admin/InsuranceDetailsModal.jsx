import React, { useState, useEffect } from 'react';
import { adminAPI } from '@api';
import {
  X,
  HeartPulse,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const InsuranceDetailsModal = ({ isOpen, onClose, insuranceId, onActionComplete }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && insuranceId) {
      fetchInsuranceDetails();
    }
  }, [isOpen, insuranceId]);

  const fetchInsuranceDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInsuranceById(insuranceId);
      setCompany(response.data.company);
    } catch (error) {
      toast.error('Failed to fetch insurance details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      approved: 'bg-green-500/20 text-green-300 border-green-400/30',
      suspended: 'bg-red-500/20 text-red-300 border-red-400/30',
      rejected: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    };
    return colors[status] || colors.pending;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'coverage', label: 'Coverage Types' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'banking', label: 'Banking' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-white/20 rounded-lg w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
            ) : (
              <>
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company.companyName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <HeartPulse className="w-8 h-8 text-blue-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{company?.companyName}</h2>
                  <p className="text-gray-400">{company?.licenseNumber}</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status */}
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Status Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Current Status</p>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(company?.status)}`}>
                          {company?.status?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Registration Number</p>
                        <p className="text-white">{company?.companyRegistrationNumber}</p>
                      </div>
                      {company?.reviewedBy && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Reviewed By</p>
                          <p className="text-white">{company.reviewedBy}</p>
                        </div>
                      )}
                      {company?.reviewedAt && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Reviewed At</p>
                          <p className="text-white">{new Date(company.reviewedAt).toLocaleString()}</p>
                        </div>
                      )}
                      {company?.statusNotes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-400 mb-1">Status Notes</p>
                          <p className="text-white">{company.statusNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-white">{company?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white">{company?.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Address</p>
                          <p className="text-white">
                            {company?.address?.street && `${company.address.street}, `}
                            {company?.address?.city && `${company.address.city}, `}
                            {company?.address?.state && `${company.address.state} `}
                            {company?.address?.zipCode && `${company.address.zipCode}, `}
                            {company?.address?.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {company?.description && (
                    <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300">{company.description}</p>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {company?.operatingHours && (
                    <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Operating Hours</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(company.operatingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{day}</span>
                            <span className="text-white">
                              {hours?.open && hours?.close
                                ? `${hours.open} - ${hours.close}`
                                : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Rating</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        <span className="text-2xl font-bold text-white">
                          {company?.rating?.average?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        ({company?.rating?.count || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {company?.documents && company.documents.length > 0 ? (
                    company.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-400" />
                          <div>
                            <p className="text-white font-medium capitalize">{doc.type}</p>
                            <p className="text-sm text-gray-400">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.verified ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <AlertCircle className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                          <a
                            href={doc.url?.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">No documents uploaded</p>
                    </div>
                  )}
                </div>
              )}

              {/* Coverage Types Tab */}
              {activeTab === 'coverage' && (
                <div className="space-y-4">
                  {company?.coverageTypes && company.coverageTypes.length > 0 ? (
                    company.coverageTypes.map((coverage, index) => (
                      <div
                        key={index}
                        className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-white capitalize">
                            {coverage.name || coverage.type}
                          </h4>
                          {coverage.basePrice && (
                            <span className="text-lg font-bold text-green-400">
                              ${coverage.basePrice}
                            </span>
                          )}
                        </div>
                        {coverage.description && (
                          <p className="text-gray-300">{coverage.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">No coverage types configured</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'statistics' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <p className="text-gray-400">Total Policies</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {company?.statistics?.totalPolicies || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-gray-400">Active Policies</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {company?.statistics?.activePolicies || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <p className="text-gray-400">Total Claims</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {company?.statistics?.totalClaims || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-gray-400">Approved Claims</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {company?.statistics?.approvedClaims || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                      <p className="text-gray-400">Total Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${company?.statistics?.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === 'banking' && (
                <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Bank Account Details</h3>
                  {company?.bankDetails ? (
                    <div className="space-y-3">
                      {company.bankDetails.accountHolderName && (
                        <div>
                          <p className="text-sm text-gray-400">Account Holder Name</p>
                          <p className="text-white">{company.bankDetails.accountHolderName}</p>
                        </div>
                      )}
                      {company.bankDetails.bankName && (
                        <div>
                          <p className="text-sm text-gray-400">Bank Name</p>
                          <p className="text-white">{company.bankDetails.bankName}</p>
                        </div>
                      )}
                      {company.bankDetails.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-400">Account Number</p>
                          <p className="text-white">***{company.bankDetails.accountNumber.slice(-4)}</p>
                        </div>
                      )}
                      {company.bankDetails.routingNumber && (
                        <div>
                          <p className="text-sm text-gray-400">Routing Number</p>
                          <p className="text-white">{company.bankDetails.routingNumber}</p>
                        </div>
                      )}
                      {company.bankDetails.swiftCode && (
                        <div>
                          <p className="text-sm text-gray-400">SWIFT Code</p>
                          <p className="text-white">{company.bankDetails.swiftCode}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">No banking information provided</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetailsModal;
