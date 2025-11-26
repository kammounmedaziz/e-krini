import React, { useState, useEffect } from 'react';
import { adminAPI } from '@api';
import toast from 'react-hot-toast';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  HeartPulse
} from 'lucide-react';

const InsuranceDocumentsManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  const fetchInsuranceCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllInsurance({ limit: 100 });
      // Filter only companies that have documents
      const companiesWithDocs = (response.data.companies || []).filter(
        company => company.documents && company.documents.length > 0
      );
      setCompanies(companiesWithDocs);
    } catch (error) {
      console.error('Error fetching insurance companies:', error);
      toast.error('Failed to fetch insurance documents');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceCompanies();
  }, []);

  const handleVerifyDocument = async (companyId, documentIndex) => {
    try {
      // For now, we'll update the local state to mark as verified
      // In a real implementation, you'd call an API endpoint to verify the document
      setCompanies(prevCompanies =>
        prevCompanies.map(company =>
          company._id === companyId
            ? {
                ...company,
                documents: company.documents.map((doc, index) =>
                  index === documentIndex ? { ...doc, verified: true } : doc
                )
              }
            : company
        )
      );
      toast.success('Document verified successfully');
    } catch (error) {
      toast.error('Failed to verify document');
      console.error(error);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (verificationFilter === 'verified') {
      return matchesSearch && company.documents.some(doc => doc.verified);
    } else if (verificationFilter === 'pending') {
      return matchesSearch && company.documents.some(doc => !doc.verified);
    }
    
    return matchesSearch;
  });

  const getDocumentTypeBadge = (type) => {
    const badges = {
      license: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Insurance License' },
      accreditation: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Accreditation' },
      registration: { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Registration' },
      certification: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'Certification' },
      other: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Other' }
    };
    const badge = badges[type] || badges.other;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Insurance Documents Management</h1>
        <button
          onClick={fetchInsuranceCompanies}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 backdrop-blur-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
            >
              <option value="">All Documents</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-12 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-gray-300">Loading documents...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300">No insurance documents found</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div key={company._id} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6">
              {/* Company Header */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                {company.logo ? (
                  <img src={company.logo} alt={company.companyName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <HeartPulse className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{company.companyName}</h3>
                  <p className="text-sm text-gray-400">{company.licenseNumber}</p>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        {getDocumentTypeBadge(doc.type)}
                      </div>
                      {doc.verified ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            Pending
                          </span>
                          <button
                            onClick={() => handleVerifyDocument(company._id, doc._id || index)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mb-3">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>

                    <a
                      href={doc.url?.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/${doc.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InsuranceDocumentsManagement;
