import React, { useState, useEffect } from 'react';
import { agencyAPI } from '../../api';
import { Building2, MapPin, Phone, Mail, Clock, FileText, Save, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AgencyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyRegistrationNumber: '',
    description: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    operatingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    services: [],
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      routingNumber: '',
      swiftCode: ''
    }
  });

  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await agencyAPI.getProfile();
      if (response.success && response.data) {
        setHasProfile(true);
        setFormData({
          companyName: response.data.companyName || '',
          companyRegistrationNumber: response.data.companyRegistrationNumber || '',
          description: response.data.description || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          operatingHours: response.data.operatingHours || formData.operatingHours,
          services: response.data.services || [],
          bankDetails: response.data.bankDetails || {
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            routingNumber: '',
            swiftCode: ''
          }
        });
        setStatus(response.data.status);
      }
    } catch (error) {
      console.log('No profile found or error:', error);
      setHasProfile(false);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.companyRegistrationNumber || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await agencyAPI.createOrUpdateProfile(formData);
      
      if (response.success) {
        toast.success(response.message || 'Profile saved successfully!');
        setHasProfile(true);
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorData = error?.response?.data;
      
      // Show validation errors if available
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach(err => toast.error(err));
      } else {
        toast.error(errorData?.message || 'Failed to save profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Agency Profile</h1>
        <p className="text-gray-400">
          {hasProfile ? 'Update your agency information' : 'Create your agency profile to start uploading documents'}
        </p>
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`mb-6 backdrop-blur-xl bg-gradient-to-r rounded-xl p-4 shadow-lg border ${
          status === 'approved'
            ? 'from-green-500/20 to-emerald-500/20 border-green-400/30'
            : status === 'pending'
            ? 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30'
            : 'from-red-500/20 to-pink-500/20 border-red-400/30'
        }`}>
          <div className="flex items-center gap-3">
            {status === 'approved' ? (
              <CheckCircle className="w-6 h-6 text-green-300" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-300" />
            )}
            <div>
              <h3 className="font-bold text-white">
                Profile Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Company Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Registration Number <span className="text-red-400">*</span>
                <span className="text-xs text-gray-400 ml-2">(Must be unique)</span>
              </label>
              <input
                type="text"
                name="companyRegistrationNumber"
                value={formData.companyRegistrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Company registration number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="+1234567890"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="contact@company.com"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Brief description of your agency"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Address</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">Street</label>
              <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Zip code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Operating Hours</h2>
          </div>
          
          <div className="space-y-3">
            {Object.keys(formData.operatingHours).map(day => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <div className="text-gray-200 capitalize">{day}</div>
                <input
                  type="text"
                  value={formData.operatingHours[day].open}
                  onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="09:00"
                />
                <input
                  type="text"
                  value={formData.operatingHours[day].close}
                  onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="18:00"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Bank Details (Optional)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleBankDetailsChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Account holder name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankDetails.bankName}
                onChange={handleBankDetailsChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Bank name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleBankDetailsChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Routing Number</label>
              <input
                type="text"
                name="routingNumber"
                value={formData.bankDetails.routingNumber}
                onChange={handleBankDetailsChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Routing number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">SWIFT Code</label>
              <input
                type="text"
                name="swiftCode"
                value={formData.bankDetails.swiftCode}
                onChange={handleBankDetailsChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="SWIFT code"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgencyProfile;
