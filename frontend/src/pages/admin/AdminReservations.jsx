import React, { useState, useEffect } from 'react';
import { reservationAPI } from '@api';
import { Card, Button } from '@ui';
import { Calendar, User, Car, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredReservations = reservations.filter(r =>
    statusFilter === 'all' || r.status === statusFilter
  );

  const statusCounts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    active: reservations.filter(r => r.status === 'active').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Reservations</h1>
          <p className="text-gray-300">System-wide reservation overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
                <div className="text-xs text-gray-300 capitalize">{status}</div>
              </div>
            </Card>
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
            <p className="text-gray-300 text-lg">No reservations found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(reservation => {
              const statusColor = getStatusColor(reservation.status);
              return (
                <Card
                  key={reservation._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {reservation.carId?.make} {reservation.carId?.model}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            ID: {reservation._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                          {reservation.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          <div>
                            <div className="text-xs text-gray-400">Total</div>
                            <div className="text-sm font-medium text-green-400">{reservation.totalPrice} TND</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservations;
