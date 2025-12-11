import React, { useState, useEffect } from 'react';
import { reservationAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Calendar,
  Car,
  User,
  DollarSign,
  Check,
  X,
  Clock,
  Eye,
  Filter,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const AgencyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getAllReservations();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (reservationId) => {
    try {
      setActionLoading(true);
      await reservationAPI.confirmReservation(reservationId);
      toast.success('Reservation confirmed successfully');
      fetchReservations();
      if (selectedReservation?._id === reservationId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to confirm reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to reject this reservation?')) return;

    try {
      setActionLoading(true);
      await reservationAPI.cancelReservation(reservationId, {
        cancellationReason: 'Rejected by agency'
      });
      toast.success('Reservation rejected');
      fetchReservations();
      if (selectedReservation?._id === reservationId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      toast.error('Failed to reject reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      active: 'green',
      completed: 'gray',
      cancelled: 'red'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: Check,
      active: Car,
      completed: Check,
      cancelled: X
    };
    return icons[status?.toLowerCase()] || Clock;
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesSearch = 
      searchTerm === '' ||
      reservation.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.carId?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.carId?.model?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    active: reservations.filter(r => r.status === 'active').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reservations Management</h1>
          <p className="text-gray-300">View and manage customer reservations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card
              key={status}
              className={`backdrop-blur-lg bg-white/10 border border-white/20 transition-all cursor-pointer ${
                statusFilter === status ? 'ring-2 ring-cyan-500' : 'hover:border-cyan-500/50'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{count}</div>
                <div className="text-sm text-gray-300 capitalize">{status}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 backdrop-blur-lg bg-white/10 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, email, or car..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </Card>

        {/* Reservations List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No reservations found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(reservation => {
              const StatusIcon = getStatusIcon(reservation.status);
              const statusColor = getStatusColor(reservation.status);

              return (
                <Card
                  key={reservation._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Car Image */}
                    <div className="lg:w-48 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {reservation.carId?.images?.[0] ? (
                        <img
                          src={reservation.carId.images[0]}
                          alt={`${reservation.carId.make} ${reservation.carId.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Reservation Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {reservation.carId?.make} {reservation.carId?.model}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Booking ID: {reservation._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                          <StatusIcon className="w-4 h-4" />
                          {reservation.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Customer</div>
                            <div className="text-sm font-medium">{reservation.userId?.username || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Pick-up</div>
                            <div className="text-sm font-medium">
                              {new Date(reservation.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Drop-off</div>
                            <div className="text-sm font-medium">
                              {new Date(reservation.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-xs text-gray-400">Total Price</div>
                            <div className="text-sm font-medium">{reservation.totalPrice} TND</div>
                          </div>
                        </div>
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
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleConfirmReservation(reservation._id)}
                              disabled={actionLoading}
                            >
                              <Check className="w-4 h-4" />
                              Confirm
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectReservation(reservation._id)}
                              disabled={actionLoading}
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedReservation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reservation Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Name</div>
                    <div className="text-white font-medium">{selectedReservation.userId?.username || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      {selectedReservation.userId?.email || 'N/A'}
                    </div>
                  </div>
                  {selectedReservation.userId?.phoneNumber && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Phone</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        {selectedReservation.userId.phoneNumber}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Car Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5 text-cyan-400" />
                  Car Information
                </h3>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xl font-bold text-white mb-2">
                    {selectedReservation.carId?.make} {selectedReservation.carId?.model}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-gray-400">Year: <span className="text-white">{selectedReservation.carId?.year}</span></div>
                    <div className="text-gray-400">Category: <span className="text-white">{selectedReservation.carId?.category}</span></div>
                    <div className="text-gray-400">License Plate: <span className="text-white">{selectedReservation.carId?.licensePlate}</span></div>
                    <div className="text-gray-400">Seats: <span className="text-white">{selectedReservation.carId?.seats}</span></div>
                  </div>
                </div>
              </div>

              {/* Reservation Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Reservation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Pick-up Date</div>
                    <div className="text-white font-medium">{new Date(selectedReservation.startDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Drop-off Date</div>
                    <div className="text-white font-medium">{new Date(selectedReservation.endDate).toLocaleString()}</div>
                  </div>
                  {selectedReservation.pickupLocation && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-400 mb-1">Pick-up Location</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        {selectedReservation.pickupLocation}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Insurance Type</div>
                    <div className="text-white font-medium capitalize">{selectedReservation.insuranceType || 'Basic'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Price</div>
                    <div className="text-green-400 font-bold text-lg">{selectedReservation.totalPrice} TND</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedReservation.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    variant="danger"
                    onClick={() => handleRejectReservation(selectedReservation._id)}
                    disabled={actionLoading}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleConfirmReservation(selectedReservation._id)}
                    disabled={actionLoading}
                  >
                    <Check className="w-4 h-4" />
                    Confirm Reservation
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyReservations;
