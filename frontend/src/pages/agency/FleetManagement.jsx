import React, { useState, useEffect } from 'react';
import { fleetAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const FleetManagement = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '' });

  const [carForm, setCarForm] = useState({
    nom: '',
    category: '',
    prixParJour: '',
    matricule: '',
    modele: '',
    marque: '',
    disponibilite: true,
    dernierMaintenance: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCars();
    fetchCategories();
  }, [filters]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fleetAPI.getCars(filters);
      setCars(response.data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fleetAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmitCar = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCar) {
        await fleetAPI.updateCar(editingCar._id, carForm);
        toast.success('Car updated successfully');
      } else {
        await fleetAPI.createCar(carForm);
        toast.success('Car created successfully');
      }
      
      setShowCarModal(false);
      setEditingCar(null);
      resetForm();
      fetchCars();
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save car');
    }
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setCarForm({
      nom: car.nom,
      category: car.category,
      prixParJour: car.prixParJour,
      matricule: car.matricule,
      modele: car.modele,
      marque: car.marque,
      disponibilite: car.disponibilite,
      dernierMaintenance: car.dernierMaintenance ? new Date(car.dernierMaintenance).toISOString().split('T')[0] : ''
    });
    setShowCarModal(true);
  };

  const handleDeleteCar = async (carId) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    try {
      await fleetAPI.deleteCar(carId);
      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete car');
    }
  };

  const resetForm = () => {
    setCarForm({
      nom: '',
      category: '',
      prixParJour: '',
      matricule: '',
      modele: '',
      marque: '',
      disponibilite: true,
      dernierMaintenance: new Date().toISOString().split('T')[0]
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fleet Management</h1>
            <p className="text-gray-300">Manage your vehicle inventory</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setEditingCar(null);
              setShowCarModal(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Add Car
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 backdrop-blur-lg bg-white/10 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, brand, or model..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Cars Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : cars.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">No cars found</p>
            <Button variant="primary" onClick={() => setShowCarModal(true)}>
              <Plus className="w-5 h-5" />
              Add Your First Car
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => (
              <Card key={car._id} className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all">
                <div className="relative mb-4">
                  <div className="absolute top-2 right-2 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {getCategoryName(car.category)}
                  </div>
                  <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <Car className="w-24 h-24 text-cyan-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{car.nom}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="font-medium">Brand:</span>
                    <span>{car.marque}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="font-medium">Model:</span>
                    <span>{car.modele}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="font-medium">Plate:</span>
                    <span>{car.matricule}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{car.prixParJour} TND</p>
                    <p className="text-sm text-gray-400">per day</p>
                  </div>
                  {car.disponibilite ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <Check className="w-4 h-4" />
                      Available
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <X className="w-4 h-4" />
                      Unavailable
                    </span>
                  )}
                </div>

                {car.needsMaintenance && (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4 p-2 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>Maintenance Due</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditCar(car)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteCar(car._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Car Form Modal */}
      {showCarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full backdrop-blur-lg bg-gray-900/90 border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingCar ? 'Edit Car' : 'Add New Car'}
              </h2>
              <button
                onClick={() => {
                  setShowCarModal(false);
                  setEditingCar(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Car Name *</label>
                <input
                  type="text"
                  required
                  value={carForm.nom}
                  onChange={(e) => setCarForm(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Toyota Corolla 2023"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Brand *</label>
                  <input
                    type="text"
                    required
                    value={carForm.marque}
                    onChange={(e) => setCarForm(prev => ({ ...prev, marque: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Model *</label>
                  <input
                    type="text"
                    required
                    value={carForm.modele}
                    onChange={(e) => setCarForm(prev => ({ ...prev, modele: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Corolla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">License Plate *</label>
                  <input
                    type="text"
                    required
                    value={carForm.matricule}
                    onChange={(e) => setCarForm(prev => ({ ...prev, matricule: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., TUN-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Price/Day (TND) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={carForm.prixParJour}
                    onChange={(e) => setCarForm(prev => ({ ...prev, prixParJour: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., 80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Category *</label>
                  <select
                    required
                    value={carForm.category}
                    onChange={(e) => setCarForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Last Maintenance *</label>
                  <input
                    type="date"
                    required
                    value={carForm.dernierMaintenance}
                    onChange={(e) => setCarForm(prev => ({ ...prev, dernierMaintenance: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-200">
                  <input
                    type="checkbox"
                    checked={carForm.disponibilite}
                    onChange={(e) => setCarForm(prev => ({ ...prev, disponibilite: e.target.checked }))}
                    className="w-5 h-5 rounded bg-white/10 border-white/20"
                  />
                  <span>Available for rent</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowCarModal(false);
                    setEditingCar(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {editingCar ? 'Update Car' : 'Add Car'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
