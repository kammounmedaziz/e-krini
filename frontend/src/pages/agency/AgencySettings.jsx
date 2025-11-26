import React, { useState } from 'react';
import { agencyAPI } from '../../api';
import { Upload, FileText, CheckCircle, X, AlertCircle, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AgencySettings = () => {
  const [businessLicense, setBusinessLicense] = useState(null);
  const [insuranceCertificate, setInsuranceCertificate] = useState(null);
  const [taxDocument, setTaxDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(null);

  const handleDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(field);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setFile(field, file);
      }
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, or PDF.');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return false;
    }
    return true;
  };

  const setFile = (field, file) => {
    switch(field) {
      case 'businessLicense':
        setBusinessLicense(file);
        break;
      case 'insuranceCertificate':
        setInsuranceCertificate(file);
        break;
      case 'taxDocument':
        setTaxDocument(file);
        break;
      default:
        break;
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFile(field, file);
    }
  };

  const removeFile = (field) => {
    setFile(field, null);
  };

  const getFileIcon = (file) => {
    if (!file) return <Upload className="w-8 h-8" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-400" />;
    return <FileCheck className="w-8 h-8 text-green-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!businessLicense && !insuranceCertificate && !taxDocument) {
      toast.error('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    if (businessLicense) formData.append('businessLicense', businessLicense);
    if (insuranceCertificate) formData.append('insuranceCertificate', insuranceCertificate);
    if (taxDocument) formData.append('taxDocument', taxDocument);

    try {
      setLoading(true);
      const res = await agencyAPI.uploadDocuments(formData);
      toast.success(res.message || 'Documents uploaded successfully!');
      // Clear file selections after successful upload
      setBusinessLicense(null);
      setInsuranceCertificate(null);
      setTaxDocument(null);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || 'Upload failed.';
      
      // If error is about profile not found, add helpful message
      if (errorMsg.includes('profile not found') || errorMsg.includes('create your profile')) {
        toast.error('Please create your agency profile first before uploading documents.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderUploadBox = (field, label, file) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">{label}</label>
      
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          dragActive === field
            ? 'border-blue-400 bg-blue-500/10'
            : file
            ? 'border-green-400 bg-green-500/10'
            : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
        }`}
        onDragEnter={(e) => handleDrag(e, field)}
        onDragLeave={(e) => handleDrag(e, field)}
        onDragOver={(e) => handleDrag(e, field)}
        onDrop={(e) => handleDrop(e, field)}
      >
        <input
          type="file"
          id={field}
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, field)}
          className="hidden"
        />
        
        {!file ? (
          <label htmlFor={field} className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-300 mb-1">
                <span className="text-blue-400 hover:text-blue-300">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">JPG, PNG or PDF (max. 10MB)</p>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(file)}
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Document Upload</h2>
        </div>
        <p className="text-gray-400 text-sm">Upload your agency verification documents</p>
      </div>

      {/* Info Banner */}
      <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Required Documents</p>
            <ul className="space-y-1 text-xs text-blue-300">
              <li>• Business License - Official business registration document</li>
              <li>• Insurance Certificate - Valid business insurance proof</li>
              <li>• Tax Document - Tax registration or compliance certificate</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="space-y-6">
            {renderUploadBox('businessLicense', 'Business License', businessLicense)}
            {renderUploadBox('insuranceCertificate', 'Insurance Certificate', insuranceCertificate)}
            {renderUploadBox('taxDocument', 'Tax Document', taxDocument)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || (!businessLicense && !insuranceCertificate && !taxDocument)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Documents</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setBusinessLicense(null);
              setInsuranceCertificate(null);
              setTaxDocument(null);
            }}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Upload Summary */}
        {(businessLicense || insuranceCertificate || taxDocument) && (
          <div className="backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                {[businessLicense, insuranceCertificate, taxDocument].filter(Boolean).length} document(s) ready to upload
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AgencySettings;
