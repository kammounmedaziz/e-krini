import React, { useState, useEffect } from 'react';
import { maintenanceAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Wrench,
  Car,
  Calendar,
  DollarSign,
  Plus,
  X,
  Edit,
  Eye,
  AlertTriangle,
  Check,
  Clock,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenanceManagement = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'routine',
    description: '',
    scheduledDate: '',
    estimatedCost: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenanceRes, vehiclesRes] = await Promise.all([
        maintenanceAPI.getAllMaintenance(),
        maintenanceAPI.getAllVehicles()
      ]);
      setMaintenanceRecords(maintenanceRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceAPI.createMaintenance(formData);
      toast.success('Maintenance record created successfully');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating maintenance:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create maintenance record');
    }
  };

  const handleUpdateStatus = async (recordId, newStatus) => {
    try {
      await maintenanceAPI.updateMaintenanceStatus(recordId, { status: newStatus });
      toast.success('Status updated successfully');
      fetchData();
      if (selectedRecord?._id === recordId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      type: 'routine',
      description: '',
      scheduledDate: '',
      estimatedCost: '',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'yellow',
      'in-progress': 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: Clock,
      'in-progress': Wrench,
      completed: Check,
      cancelled: X
    };
    return icons[status?.toLowerCase()] || Clock;
  };

  const getTypeColor = (type) => {
    const colors = {
      routine: 'blue',
      repair: 'red',
      inspection: 'yellow',
      upgrade: 'purple'
    };
    return colors[type?.toLowerCase()] || 'gray';
  };

  const filteredRecords = maintenanceRecords.filter(record => 
    statusFilter === 'all' || record.status === statusFilter
  );

  const statusCounts = {
    all: maintenanceRecords.length,
    scheduled: maintenanceRecords.filter(r => r.status === 'scheduled').length,
    'in-progress': maintenanceRecords.filter(r => r.status === 'in-progress').length,
    completed: maintenanceRecords.filter(r => r.status === 'completed').length
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Maintenance Management</h1>
            <p className="text-gray-300">Track and manage vehicle maintenance</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Stats Cards */}
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

        {/* Maintenance Records */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No maintenance records found</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)} className="mt-4">
              Schedule First Maintenance
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map(record => {
              const StatusIcon = getStatusIcon(record.status);
              const statusColor = getStatusColor(record.status);
              const typeColor = getTypeColor(record.type);

              return (
                <Card
                  key={record._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{record.description}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeColor}-500/20 text-${typeColor}-400 border border-${typeColor}-500/30 capitalize`}>
                              {record.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                              <StatusIcon className="w-3 h-3" />
                              {record.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Car className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Vehicle</div>
                            <div className="text-sm font-medium">
                              {record.vehicleId?.licensePlate || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="text-xs text-gray-400">Scheduled Date</div>
                            <div className="text-sm font-medium">
                              {new Date(record.scheduledDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-xs text-gray-400">
                              {record.actualCost ? 'Actual Cost' : 'Estimated Cost'}
                            </div>
                            <div className="text-sm font-medium">
                              {record.actualCost || record.estimatedCost || 0} TND
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        {record.status === 'scheduled' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(record._id, 'in-progress')}
                          >
                            <Wrench className="w-4 h-4" />
                            Start Maintenance
                          </Button>
                        )}
                        {record.status === 'in-progress' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(record._id, 'completed')}
                          >
                            <Check className="w-4 h-4" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Schedule Maintenance</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vehicle *
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id} className="bg-gray-800">
                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maintenance Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="routine" className="bg-gray-800">Routine Maintenance</option>
                    <option value="repair" className="bg-gray-800">Repair</option>
                    <option value="inspection" className="bg-gray-800">Inspection</option>
                    <option value="upgrade" className="bg-gray-800">Upgrade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="e.g., Oil change and filter replacement"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Cost (TND)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes or special instructions..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    <Plus className="w-4 h-4" />
                    Schedule Maintenance
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-gray-900/95 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Maintenance Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{selectedRecord.description}</h3>
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getTypeColor(selectedRecord.type)}-500/20 text-${getTypeColor(selectedRecord.type)}-400 border border-${getTypeColor(selectedRecord.type)}-500/30 capitalize`}>
                      {selectedRecord.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(selectedRecord.status)}-500/20 text-${getStatusColor(selectedRecord.status)}-400 border border-${getStatusColor(selectedRecord.status)}-500/30`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Vehicle</div>
                    <div className="text-white font-medium">{selectedRecord.vehicleId?.licensePlate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Scheduled Date</div>
                    <div className="text-white font-medium">
                      {new Date(selectedRecord.scheduledDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Estimated Cost</div>
                    <div className="text-white font-medium">{selectedRecord.estimatedCost || 0} TND</div>
                  </div>
                  {selectedRecord.actualCost && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Actual Cost</div>
                      <div className="text-green-400 font-bold">{selectedRecord.actualCost} TND</div>
                    </div>
                  )}
                </div>

                {selectedRecord.notes && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Notes</div>
                    <p className="text-white p-3 bg-white/5 rounded-lg border border-white/10">
                      {selectedRecord.notes}
                    </p>
                  </div>
                )}

                {selectedRecord.status === 'scheduled' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedRecord._id, 'in-progress')}
                    >
                      <Wrench className="w-4 h-4" />
                      Start Maintenance
                    </Button>
                  </div>
                )}

                {selectedRecord.status === 'in-progress' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedRecord._id, 'completed')}
                    >
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceManagement;
