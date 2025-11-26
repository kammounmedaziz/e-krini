import React from 'react';

const KYCStatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const statusConfig = {
    unverified: {
      label: 'Not Verified',
      icon: '⚠️',
      className: 'bg-gray-100 text-gray-800 border-gray-300',
    },
    pending: {
      label: 'Pending Review',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    approved: {
      label: 'Verified',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-300',
    },
    rejected: {
      label: 'Rejected',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-300',
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const config = statusConfig[status] || statusConfig.unverified;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.className} ${sizeClass}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
};

export default KYCStatusBadge;
