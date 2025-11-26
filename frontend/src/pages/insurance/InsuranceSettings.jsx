import React, { useState } from 'react';
import { insuranceAPI } from '../../api';
import { Upload, FileText, CheckCircle, X, AlertCircle, FileCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const InsuranceSettings = () => {
  const [insuranceLicense, setInsuranceLicense] = useState(null);
  const [certificationDocs, setCertificationDocs] = useState([]);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (field === 'insuranceLicense') {
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
          setInsuranceLicense(file);
        }
      } else if (field === 'certificationDocs') {
        const files = Array.from(e.dataTransfer.files).filter(validateFile);
        setCertificationDocs(prev => [...prev, ...files]);
      }
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name}: Invalid file type. Please upload JPG, PNG, or PDF.`);
      return false;
    }
    if (file.size > maxSize) {
      toast.error(`${file.name}: File size exceeds 10MB limit.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e, field) => {
    if (field === 'insuranceLicense') {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        setInsuranceLicense(file);
      }
    } else if (field === 'certificationDocs') {
      const files = Array.from(e.target.files || []).filter(validateFile);
      setCertificationDocs(prev => [...prev, ...files]);
    }
  };

  const removeCertificationDoc = (index) => {
    setCertificationDocs(prev => prev.filter((_, i) => i !== index));
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

    if (!insuranceLicense && certificationDocs.length === 0) {
      toast.error('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    if (insuranceLicense) formData.append('insuranceLicense', insuranceLicense);
    if (certificationDocs.length > 0) {
      certificationDocs.forEach((f) => formData.append('certificationDocs', f));
    }

    try {
      setLoading(true);
      const res = await insuranceAPI.uploadDocuments(formData);
      toast.success(res.message || 'Documents uploaded successfully!');
      // Clear file selections after successful upload
      setInsuranceLicense(null);
      setCertificationDocs([]);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || 'Upload failed.';
      
      // If error is about profile not found, add helpful message
      if (errorMsg.includes('profile not found') || errorMsg.includes('create your profile')) {
        toast.error('Please create your insurance profile first before uploading documents.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">Document Upload</h2>
        </div>
        <p className="text-gray-400 text-sm">Upload your insurance verification documents</p>
      </div>

      {/* Info Banner */}
      <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-200">
            <p className="font-medium mb-1">Required Documents</p>
            <ul className="space-y-1 text-xs text-emerald-300">
              <li>• Insurance License - Valid insurance provider license</li>
              <li>• Certification Documents - Professional certifications and accreditations (multiple files allowed)</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="space-y-6">
            {/* Insurance License Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Insurance License</label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                  dragActive === 'insuranceLicense'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : insuranceLicense
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
                }`}
                onDragEnter={(e) => handleDrag(e, 'insuranceLicense')}
                onDragLeave={(e) => handleDrag(e, 'insuranceLicense')}
                onDragOver={(e) => handleDrag(e, 'insuranceLicense')}
                onDrop={(e) => handleDrop(e, 'insuranceLicense')}
              >
                <input
                  type="file"
                  id="insuranceLicense"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'insuranceLicense')}
                  className="hidden"
                />
                
                {!insuranceLicense ? (
                  <label htmlFor="insuranceLicense" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-300 mb-1">
                        <span className="text-emerald-400 hover:text-emerald-300">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG or PDF (max. 10MB)</p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(insuranceLicense)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white truncate max-w-xs">{insuranceLicense.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(insuranceLicense.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInsuranceLicense(null)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Certification Documents Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Certification Documents <span className="text-xs text-gray-400">(Multiple files allowed)</span>
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                  dragActive === 'certificationDocs'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : certificationDocs.length > 0
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
                }`}
                onDragEnter={(e) => handleDrag(e, 'certificationDocs')}
                onDragLeave={(e) => handleDrag(e, 'certificationDocs')}
                onDragOver={(e) => handleDrag(e, 'certificationDocs')}
                onDrop={(e) => handleDrop(e, 'certificationDocs')}
              >
                <input
                  type="file"
                  id="certificationDocs"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleFileChange(e, 'certificationDocs')}
                  className="hidden"
                />
                
                <label htmlFor="certificationDocs" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-300 mb-1">
                      <span className="text-emerald-400 hover:text-emerald-300">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG or PDF (max. 10MB per file)</p>
                  </div>
                </label>
              </div>

              {/* List of uploaded certification documents */}
              {certificationDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {certificationDocs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white truncate max-w-md">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertificationDoc(index)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || (!insuranceLicense && certificationDocs.length === 0)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              setInsuranceLicense(null);
              setCertificationDocs([]);
            }}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Upload Summary */}
        {(insuranceLicense || certificationDocs.length > 0) && (
          <div className="backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                {(insuranceLicense ? 1 : 0) + certificationDocs.length} document(s) ready to upload
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InsuranceSettings;
