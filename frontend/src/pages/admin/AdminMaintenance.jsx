import React, { useState, useEffect } from 'react';
import { maintenanceAPI } from '@api';
import { Card } from '@ui';
import { Wrench, Car, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMaintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const response = await maintenanceAPI.getAllMaintenance();
      setMaintenance(response.data || []);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = maintenance.filter(r =>
    statusFilter === 'all' || r.status === statusFilter
  );

  const statusCounts = {
    all: maintenance.length,
    scheduled: maintenance.filter(m => m.status === 'scheduled').length,
    'in-progress': maintenance.filter(m => m.status === 'in-progress').length,
    completed: maintenance.filter(m => m.status === 'completed').length
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'yellow',
      'in-progress': 'blue',
      completed: 'green'
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Maintenance Overview</h1>
          <p className="text-gray-300">System-wide maintenance tracking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <div className="text-sm text-gray-300 capitalize">{status.replace('-', ' ')}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Maintenance List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No maintenance records found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map(record => {
              const statusColor = getStatusColor(record.status);
              return (
                <Card
                  key={record._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{record.description}</h3>
                      <p className="text-gray-400 text-sm capitalize">{record.type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Car className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-xs text-gray-400">Vehicle</div>
                        <div className="text-sm font-medium">{record.vehicleId?.licensePlate || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-xs text-gray-400">Scheduled</div>
                        <div className="text-sm font-medium">
                          {new Date(record.scheduledDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-xs text-gray-400">Cost</div>
                        <div className="text-sm font-medium">{record.actualCost || record.estimatedCost || 0} TND</div>
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

export default AdminMaintenance;
