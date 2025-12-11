import React, { useState, useEffect } from 'react';
import { reservationAPI } from '@api';
import { Card, Button } from '@ui';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  X,
  Calendar,
  Car,
  DollarSign,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await reservationAPI.getMyContracts(user.id);
      setContracts(response.data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async (contractId) => {
    try {
      await reservationAPI.signContract(contractId, {
        signature: 'Digital Signature',
        signedAt: new Date().toISOString()
      });
      toast.success('Contract signed successfully');
      fetchContracts();
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to sign contract');
    }
  };

  const handleDownloadPDF = async (contractId) => {
    try {
      const blob = await reservationAPI.downloadContractPDF(contractId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Contract downloaded');
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Failed to download contract');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      signed: 'bg-green-500/20 text-green-400 border-green-500/30',
      active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const statusIcons = {
      draft: FileText,
      pending: Clock,
      signed: CheckCircle,
      active: Shield,
      completed: CheckCircle,
      cancelled: X
    };

    const Icon = statusIcons[status] || FileText;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredContracts = filter === 'all' 
    ? contracts 
    : contracts.filter(c => c.status === filter);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Contracts</h1>
          <p className="text-gray-300">View and manage your rental contracts</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'draft', 'pending', 'signed', 'active', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Contracts List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No {filter !== 'all' ? filter : ''} contracts found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map(contract => (
              <Card key={contract._id} className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Contract Icon */}
                  <div className="w-full md:w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-16 h-16 text-cyan-400" />
                  </div>

                  {/* Contract Details */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Contract #{contract.contractNumber || contract._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-gray-400 text-sm">Created: {new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Car className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">Vehicle</p>
                          <p className="font-medium">Reservation #{contract.reservationId?.slice(-8)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">Duration</p>
                          <p className="font-medium">
                            {contract.startDate && contract.endDate ? 
                              `${new Date(contract.startDate).toLocaleDateString()} - ${new Date(contract.endDate).toLocaleDateString()}` 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">Total Amount</p>
                          <p className="font-medium text-cyan-400">{contract.totalAmount || 0} TND</p>
                        </div>
                      </div>
                    </div>

                    {/* Contract Rules */}
                    {contract.rules && contract.rules.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300 font-medium mb-2">Contract Terms:</p>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {contract.rules.slice(0, 3).map((rule, idx) => (
                            <li key={idx}>• {rule}</li>
                          ))}
                          {contract.rules.length > 3 && (
                            <li className="text-cyan-400">+ {contract.rules.length - 3} more terms</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>

                      {contract.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSignContract(contract._id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Sign Contract
                        </Button>
                      )}

                      {(contract.status === 'signed' || contract.status === 'active' || contract.status === 'completed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(contract._id)}
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full backdrop-blur-lg bg-gray-900/90 border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Contract Details</h2>
                <p className="text-gray-400">Contract #{selectedContract.contractNumber || selectedContract._id.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedContract(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                {getStatusBadge(selectedContract.status)}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                  <p className="text-white font-medium">
                    {selectedContract.startDate ? new Date(selectedContract.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                  <p className="text-white font-medium">
                    {selectedContract.endDate ? new Date(selectedContract.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Financial Information</label>
                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Amount:</span>
                      <span className="text-xl font-bold text-cyan-400">{selectedContract.totalAmount || 0} TND</span>
                    </div>
                    {selectedContract.depositAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Deposit:</span>
                        <span className="text-gray-300">{selectedContract.depositAmount} TND</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Contract Rules */}
              {selectedContract.rules && selectedContract.rules.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Contract Terms & Conditions</label>
                  <Card className="bg-white/5 border-white/10">
                    <ul className="space-y-2">
                      {selectedContract.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Signature Info */}
              {selectedContract.signedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Signature</label>
                  <Card className="bg-green-500/10 border-green-500/30">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Digitally Signed</p>
                        <p className="text-sm text-gray-400">
                          {new Date(selectedContract.signedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Created At</label>
                  <p className="text-gray-300">{new Date(selectedContract.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Last Updated</label>
                  <p className="text-gray-300">{new Date(selectedContract.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-white/10">
              {selectedContract.status === 'pending' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    handleSignContract(selectedContract._id);
                    setShowDetailsModal(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Sign Contract
                </Button>
              )}
              {(selectedContract.status === 'signed' || selectedContract.status === 'active' || selectedContract.status === 'completed') && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleDownloadPDF(selectedContract._id)}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              )}
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedContract(null);
                }}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyContracts;
