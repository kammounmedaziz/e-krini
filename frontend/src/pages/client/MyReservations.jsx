import React, { useState, useEffect } from 'react';
import { reservationAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Calendar,
  Car,
  Clock,
  DollarSign,
  Eye,
  X,
  Check,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, active, completed, cancelled

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await reservationAPI.getMyReservations(user.id);
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    try {
      await reservationAPI.cancelReservation(reservationId, reason);
      toast.success('Reservation cancelled successfully');
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to cancel reservation');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const statusIcons = {
      pending: Clock,
      confirmed: Check,
      active: Car,
      completed: Check,
      cancelled: X
    };

    const Icon = statusIcons[status] || AlertCircle;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Reservations</h1>
          <p className="text-gray-300">Manage your car rental reservations</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => (
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

        {/* Reservations List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No {filter !== 'all' ? filter : ''} reservations found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(reservation => (
              <Card key={reservation._id} className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Car Image Placeholder */}
                  <div className="w-full md:w-48 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <Car className="w-16 h-16 text-cyan-400" />
                  </div>

                  {/* Reservation Details */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {reservation.carBrand} {reservation.carModel}
                        </h3>
                        <p className="text-gray-400 text-sm">Reservation ID: {reservation.reservationId}</p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">Start Date</p>
                          <p className="font-medium">{new Date(reservation.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">End Date</p>
                          <p className="font-medium">{new Date(reservation.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">Total Price</p>
                          <p className="font-medium text-cyan-400">{reservation.totalPrice} TND</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                      <FileText className="w-4 h-4" />
                      <span>Insurance: {reservation.insuranceType}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>

                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation._id)}
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      )}

                      {reservation.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                          Download Invoice
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
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full backdrop-blur-lg bg-gray-900/90 border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Reservation Details</h2>
                <p className="text-gray-400">{selectedReservation.reservationId}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReservation(null);
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
                {getStatusBadge(selectedReservation.status)}
              </div>

              {/* Car Details */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Vehicle</label>
                <Card className="bg-white/5 border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                      <Car className="w-10 h-10 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedReservation.carBrand} {selectedReservation.carModel}
                      </h3>
                      <p className="text-gray-400 text-sm">Car ID: {selectedReservation.carId}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                  <p className="text-white font-medium">{new Date(selectedReservation.startDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                  <p className="text-white font-medium">{new Date(selectedReservation.endDate).toLocaleString()}</p>
                </div>
              </div>

              {/* Insurance & Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Insurance Type</label>
                <p className="text-white font-medium capitalize">{selectedReservation.insuranceType}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pricing</label>
                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Price:</span>
                      <span className="text-xl font-bold text-cyan-400">{selectedReservation.totalPrice} TND</span>
                    </div>
                    {selectedReservation.depositAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Deposit:</span>
                        <span className="text-gray-300">{selectedReservation.depositAmount} TND</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Created At</label>
                  <p className="text-gray-300">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Last Updated</label>
                  <p className="text-gray-300">{new Date(selectedReservation.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-white/10">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReservation(null);
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

export default MyReservations;
