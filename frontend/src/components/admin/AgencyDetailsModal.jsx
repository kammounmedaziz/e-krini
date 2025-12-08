import React, { useState, useEffect } from 'react';
import { adminAPI } from '@api';
import {
  X,
  Building2,
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
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

const AgencyDetailsModal = ({ isOpen, onClose, agencyId, onActionComplete }) => {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && agencyId) {
      fetchAgencyDetails();
    }
  }, [isOpen, agencyId]);

  const fetchAgencyDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAgencyById(agencyId);
      setAgency(response.data.agency);
    } catch (error) {
      toast.error('Failed to fetch agency details');
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
    { id: 'services', label: 'Services' },
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
                {agency?.logo ? (
                  <img
                    src={agency.logo}
                    alt={agency.companyName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-purple-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{agency?.companyName}</h2>
                  <p className="text-gray-400">{agency?.companyRegistrationNumber}</p>
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
                  ? 'text-purple-400 border-purple-400'
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
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
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(agency?.status)}`}>
                          {agency?.status?.toUpperCase()}
                        </span>
                      </div>
                      {agency?.reviewedBy && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Reviewed By</p>
                          <p className="text-white">{agency.reviewedBy}</p>
                        </div>
                      )}
                      {agency?.reviewedAt && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Reviewed At</p>
                          <p className="text-white">{new Date(agency.reviewedAt).toLocaleString()}</p>
                        </div>
                      )}
                      {agency?.statusNotes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-400 mb-1">Status Notes</p>
                          <p className="text-white">{agency.statusNotes}</p>
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
                          <p className="text-white">{agency?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white">{agency?.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Address</p>
                          <p className="text-white">
                            {agency?.address?.street && `${agency.address.street}, `}
                            {agency?.address?.city && `${agency.address.city}, `}
                            {agency?.address?.state && `${agency.address.state} `}
                            {agency?.address?.zipCode && `${agency.address.zipCode}, `}
                            {agency?.address?.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {agency?.description && (
                    <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300">{agency.description}</p>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {agency?.operatingHours && (
                    <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Operating Hours</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(agency.operatingHours).map(([day, hours]) => (
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
                          {agency?.rating?.average?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        ({agency?.rating?.count || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {agency?.documents && agency.documents.length > 0 ? (
                    agency.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-purple-400" />
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
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-all"
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

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  {agency?.services && agency.services.length > 0 ? (
                    agency.services.map((service, index) => (
                      <div
                        key={index}
                        className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <h4 className="text-lg font-semibold text-white capitalize mb-2">
                          {service.type}
                        </h4>
                        {service.description && (
                          <p className="text-gray-300 mb-2">{service.description}</p>
                        )}
                        {service.pricing && (
                          <div className="text-sm text-gray-400">
                            Pricing: {JSON.stringify(service.pricing)}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">No services configured</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'statistics' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <p className="text-gray-400">Total Bookings</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {agency?.statistics?.totalBookings || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-gray-400">Completed Bookings</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {agency?.statistics?.completedBookings || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                      <p className="text-gray-400">Total Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${agency?.statistics?.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-purple-400" />
                      <p className="text-gray-400">Active Vehicles</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {agency?.statistics?.activeVehicles || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === 'banking' && (
                <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Bank Account Details</h3>
                  {agency?.bankDetails ? (
                    <div className="space-y-3">
                      {agency.bankDetails.accountHolderName && (
                        <div>
                          <p className="text-sm text-gray-400">Account Holder Name</p>
                          <p className="text-white">{agency.bankDetails.accountHolderName}</p>
                        </div>
                      )}
                      {agency.bankDetails.bankName && (
                        <div>
                          <p className="text-sm text-gray-400">Bank Name</p>
                          <p className="text-white">{agency.bankDetails.bankName}</p>
                        </div>
                      )}
                      {agency.bankDetails.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-400">Account Number</p>
                          <p className="text-white">***{agency.bankDetails.accountNumber.slice(-4)}</p>
                        </div>
                      )}
                      {agency.bankDetails.routingNumber && (
                        <div>
                          <p className="text-sm text-gray-400">Routing Number</p>
                          <p className="text-white">{agency.bankDetails.routingNumber}</p>
                        </div>
                      )}
                      {agency.bankDetails.swiftCode && (
                        <div>
                          <p className="text-sm text-gray-400">SWIFT Code</p>
                          <p className="text-white">{agency.bankDetails.swiftCode}</p>
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

export default AgencyDetailsModal;
