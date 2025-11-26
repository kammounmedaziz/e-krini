import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const KYCSubmission = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard where KYC is now integrated
    toast.info('KYC verification is now available in your dashboard');
    navigate('/client/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default KYCSubmission;
