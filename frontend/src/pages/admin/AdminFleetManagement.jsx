import React, { useState, useEffect } from 'react';
import { fleetAPI } from '@api';
import { Card, Button } from '@ui';
import { Car, Search, Filter, Eye, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFleetManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fleetAPI.getCars();
      setCars(response.data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load fleet');
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars.filter(car =>
    searchTerm === '' ||
    car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      rented: 'yellow',
      maintenance: 'red',
      reserved: 'blue'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fleet Management (All Agencies)</h1>
          <p className="text-gray-300">System-wide fleet overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{cars.length}</div>
              <div className="text-sm text-gray-300">Total Vehicles</div>
            </div>
          </Card>
          <Card className="backdrop-blur-lg bg-green-500/20 border border-green-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {cars.filter(c => c.status === 'available').length}
              </div>
              <div className="text-sm text-gray-300">Available</div>
            </div>
          </Card>
          <Card className="backdrop-blur-lg bg-yellow-500/20 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {cars.filter(c => c.status === 'rented').length}
              </div>
              <div className="text-sm text-gray-300">Rented</div>
            </div>
          </Card>
          <Card className="backdrop-blur-lg bg-red-500/20 border border-red-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {cars.filter(c => c.status === 'maintenance').length}
              </div>
              <div className="text-sm text-gray-300">Maintenance</div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 backdrop-blur-lg bg-white/10 border border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by make, model, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </Card>

        {/* Cars Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredCars.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No vehicles found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map(car => {
              const statusColor = getStatusColor(car.status);
              return (
                <Card
                  key={car._id}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden mb-4">
                    {car.images?.[0] ? (
                      <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{car.year} • {car.category}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30 capitalize`}>
                      {car.status}
                    </span>
                    <div className="text-cyan-400 font-bold">{car.pricePerDay} TND/day</div>
                  </div>

                  {car.agencyId && (
                    <div className="flex items-center gap-2 text-gray-300 text-sm mb-4 p-2 bg-white/5 rounded-lg">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>{car.agencyId.name || 'Unknown Agency'}</span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setSelectedCar(car);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFleetManagement;
