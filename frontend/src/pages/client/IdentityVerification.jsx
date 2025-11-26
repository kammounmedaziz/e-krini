import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { kycAPI } from '../../api';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';

const IdentityVerification = () => {
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [files, setFiles] = useState({
    passport: null,
    drivers_license: null,
    national_id: null,
    utility_bill: null,
    bank_statement: null,
    selfie: null
  });
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await kycAPI.getKycStatus();
      setKycStatus(response.data);
    } catch (error) {
      console.error('Error checking KYC status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleFileChange = (documentType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and PDF files are allowed');
      return;
    }

    setFiles(prev => ({ ...prev, [documentType]: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [documentType]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [documentType]: 'pdf' }));
    }
  };

  const removeFile = (documentType) => {
    setFiles(prev => ({ ...prev, [documentType]: null }));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[documentType];
      return newPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least one file is selected
    const selectedFiles = Object.entries(files).filter(([_, file]) => file !== null);
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const documentTypes = [];

      selectedFiles.forEach(([type, file]) => {
        formData.append('documents', file);
        documentTypes.push(type);
      });

      formData.append('documentTypes', JSON.stringify(documentTypes));

      await kycAPI.submitKyc(formData);

      toast.success('KYC documents submitted successfully!');
      await checkKycStatus();
      
      // Clear form
      setFiles({
        passport: null,
        drivers_license: null,
        national_id: null,
        utility_bill: null,
        bank_statement: null,
        selfie: null
      });
      setPreviews({});

    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit documents');
    } finally {
      setLoading(false);
    }
  };

  const documentLabels = {
    passport: { icon: '🛂', label: 'Passport', desc: 'Clear photo of passport page' },
    drivers_license: { icon: '🪪', label: "Driver's License", desc: 'Front and back of license' },
    national_id: { icon: '🆔', label: 'National ID', desc: 'Front and back of ID card' },
    utility_bill: { icon: '📄', label: 'Utility Bill', desc: 'Recent bill (3 months)' },
    bank_statement: { icon: '🏦', label: 'Bank Statement', desc: 'Recent statement (3 months)' },
    selfie: { icon: '🤳', label: 'Selfie', desc: 'Holding your ID document' }
  };

  const getStatusBadge = () => {
    if (!kycStatus) return null;

    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', icon: Clock, text: 'Pending Review' },
      approved: { color: 'bg-green-500/20 text-green-300 border-green-400/30', icon: CheckCircle, text: 'Verified' },
      rejected: { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: XCircle, text: 'Rejected' }
    };

    const config = statusConfig[kycStatus.kycStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{config.text}</span>
      </div>
    );
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Approved Status
  if (kycStatus?.kycStatus === 'approved') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Identity Verified!</h2>
          <p className="text-gray-300 mb-4">
            Your identity has been successfully verified. You now have full access to all platform features.
          </p>
          <p className="text-sm text-gray-400">
            Verified on: {new Date(kycStatus.approvedAt).toLocaleDateString()}
          </p>
          
          {kycStatus.documents && kycStatus.documents.length > 0 && (
            <div className="mt-8 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Verified Documents:</h3>
              <div className="space-y-2">
                {kycStatus.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-2xl">{documentLabels[doc.type]?.icon || '📄'}</span>
                    <span className="flex-1 text-white">{documentLabels[doc.type]?.label || doc.type}</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pending Status
  if (kycStatus?.kycStatus === 'pending') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Under Review</h2>
            <p className="text-gray-300 mb-2">
              Your documents are being reviewed by our verification team.
            </p>
            <p className="text-sm text-gray-400">
              This usually takes 1-2 business days.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Submitted: {new Date(kycStatus.submittedAt).toLocaleString()}
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Submitted Documents</h3>
              <button
                onClick={checkKycStatus}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
            <div className="space-y-3">
              {kycStatus.documents?.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{documentLabels[doc.type]?.icon || '📄'}</span>
                    <div>
                      <p className="font-medium text-white">{documentLabels[doc.type]?.label || doc.type}</p>
                      <p className="text-sm text-gray-400">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-300">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rejected Status
  if (kycStatus?.kycStatus === 'rejected') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Verification Rejected</h2>
            <div className="backdrop-blur-lg bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-300 mb-2">Reason for Rejection:</p>
              <p className="text-red-200">{kycStatus.rejectionReason || 'No reason provided'}</p>
            </div>
            <p className="text-gray-300 mb-6">
              Please review the feedback and re-submit your documents with the necessary corrections.
            </p>
          </div>

          <button
            onClick={() => {
              setKycStatus(null);
              checkKycStatus();
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            Re-submit Documents
          </button>
        </div>
      </div>
    );
  }

  // Upload Form (No KYC)
  return (
    <div className="max-w-6xl mx-auto">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-gray-300">
            Upload your identity documents to verify your account and unlock all features.
          </p>
        </div>

        <div className="backdrop-blur-lg bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-cyan-200 mb-2">Required Documents:</h3>
              <ul className="text-sm text-cyan-100 space-y-1">
                <li>• At least one government-issued ID (Passport, Driver's License, or National ID)</li>
                <li>• Proof of address (Utility Bill or Bank Statement within 3 months)</li>
                <li>• A clear selfie holding your ID document</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(files).map((docType) => {
              // Check if this document type was previously submitted and get its status
              const submittedDoc = kycStatus?.documents?.find(doc => doc.type === docType);
              const docStatus = submittedDoc?.status || 'not_submitted';
              
              const getStatusConfig = (status) => {
                switch (status) {
                  case 'approved':
                    return {
                      bgClass: 'backdrop-blur-lg bg-green-500/10 border-green-400/30',
                      textColor: 'text-green-200',
                      buttonText: 'File Approved',
                      buttonClass: 'bg-green-500/20 text-green-300 border-green-400/30',
                      icon: <CheckCircle className="w-5 h-5 text-green-400" />
                    };
                  case 'pending':
                    return {
                      bgClass: 'backdrop-blur-lg bg-yellow-500/10 border-yellow-400/30',
                      textColor: 'text-yellow-200',
                      buttonText: 'Pending Review',
                      buttonClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
                      icon: <Clock className="w-5 h-5 text-yellow-400" />
                    };
                  case 'rejected':
                    return {
                      bgClass: 'backdrop-blur-lg bg-red-500/10 border-red-400/30',
                      textColor: 'text-red-200',
                      buttonText: 'Upload Again',
                      buttonClass: 'bg-red-500/20 text-red-300 border-red-400/30',
                      icon: <XCircle className="w-5 h-5 text-red-400" />
                    };
                  default:
                    return {
                      bgClass: 'backdrop-blur-lg bg-white/5 border-2 border-dashed border-white/20 hover:border-cyan-400/50',
                      textColor: 'text-white',
                      buttonText: 'Choose File',
                      buttonClass: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600',
                      icon: null
                    };
                }
              };
              
              const statusConfig = getStatusConfig(docStatus);
              
              return (
                <div 
                  key={docType} 
                  className={`rounded-xl p-6 transition-all ${statusConfig.bgClass}`}
                >
                  <label className={`cursor-pointer block ${docStatus !== 'not_submitted' ? 'pointer-events-none' : ''}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">
                        {documentLabels[docType]?.icon || '📄'}
                      </div>
                      <h3 className={`font-semibold mb-1 ${statusConfig.textColor}`}>
                        {documentLabels[docType]?.label || docType}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {documentLabels[docType]?.desc}
                      </p>
                      
                      {docStatus === 'not_submitted' && !files[docType] ? (
                        <div className="mt-4">
                          <span className={`inline-block ${statusConfig.buttonClass} px-4 py-2 rounded-lg text-sm transition-all`}>
                            {statusConfig.buttonText}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">Max 10MB</p>
                        </div>
                      ) : docStatus === 'not_submitted' && files[docType] ? (
                        <div className="mt-4">
                          {previews[docType] === 'pdf' ? (
                            <div className="bg-white/10 p-4 rounded-lg">
                              <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                              <p className="text-sm font-medium text-white truncate">{files[docType].name}</p>
                              <p className="text-xs text-gray-400">
                                {(files[docType].size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <img
                              src={previews[docType]}
                              alt={docType}
                              className="w-full h-32 object-cover rounded-lg border border-white/20"
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFile(docType);
                            }}
                            className="mt-2 flex items-center gap-1 text-red-400 text-sm hover:text-red-300 mx-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${statusConfig.buttonClass}`}>
                            {statusConfig.icon}
                            {statusConfig.buttonText}
                          </div>
                          {submittedDoc && (
                            <p className="text-xs text-gray-500 mt-2">
                              Submitted: {new Date(submittedDoc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {docStatus === 'not_submitted' && (
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(docType, e)}
                      />
                    )}
                  </label>
                </div>
              );
            })}
          </div>

          <div className="backdrop-blur-lg bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-200 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Important Guidelines
            </h4>
            <ul className="text-sm text-yellow-100 space-y-1">
              <li>• Ensure all documents are clear and readable</li>
              <li>• Documents must be valid and not expired</li>
              <li>• Personal information must match across all documents</li>
              <li>• Selfie should clearly show your face and ID</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || Object.values(files).every(f => f === null)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Submit for Verification
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdentityVerification;
