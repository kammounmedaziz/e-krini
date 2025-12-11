import React, { useState, useEffect } from 'react';
import { fleetAPI, reservationAPI, promotionAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Car,
  Calendar,
  DollarSign,
  Filter,
  Search,
  ChevronDown,
  MapPin,
  Users,
  Fuel,
  Settings as SettingsIcon,
  Star,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const BrowseCars = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    marque: '',
    minPrice: '',
    maxPrice: '',
    disponibilite: 'true',
    search: ''
  });

  // Booking details
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    insuranceType: 'standard',
    couponCode: ''
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotalPrice = () => {
    if (!selectedCar || !bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    return days * selectedCar.prixParJour;
  };

  const handleBookCar = async () => {
    try {
      if (!bookingData.startDate || !bookingData.endDate) {
        toast.error('Please select rental dates');
        return;
      }

      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      
      if (start >= end) {
        toast.error('End date must be after start date');
        return;
      }

      const reservationPayload = {
        carId: selectedCar._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        insuranceType: bookingData.insuranceType,
        totalPrice: calculateTotalPrice()
      };

      if (bookingData.couponCode) {
        // Validate coupon first
        try {
          await promotionAPI.validateCoupon(bookingData.couponCode, reservationPayload);
          reservationPayload.couponCode = bookingData.couponCode;
        } catch (error) {
          toast.error('Invalid coupon code');
          return;
        }
      }

      const response = await reservationAPI.createReservation(reservationPayload);
      toast.success('Reservation created successfully!');
      setShowBookingModal(false);
      setSelectedCar(null);
      setBookingData({
        startDate: '',
        endDate: '',
        insuranceType: 'standard',
        couponCode: ''
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create reservation');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Available Cars</h1>
          <p className="text-gray-300">Find your perfect rental car</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 backdrop-blur-lg bg-white/10 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Min Price (TND/day)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Max Price (TND/day)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
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
            <p className="text-gray-300 text-lg">No cars available</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => (
              <Card key={car._id} className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all">
                <div className="relative">
                  <div className="absolute top-2 right-2 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {getCategoryName(car.category)}
                  </div>
                  <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Car className="w-24 h-24 text-cyan-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{car.nom}</h3>
                <div className="flex items-center gap-2 text-gray-300 mb-3">
                  <span className="text-sm">{car.marque}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm">{car.modele}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Settings className="w-4 h-4" />
                    <span>Manual</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Users className="w-4 h-4" />
                    <span>5 Seats</span>
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

                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!car.disponibilite}
                  onClick={() => {
                    setSelectedCar(car);
                    setShowBookingModal(true);
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedCar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full backdrop-blur-lg bg-gray-900/90 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Book {selectedCar.nom}</h2>
                <p className="text-gray-300">{selectedCar.marque} {selectedCar.modele}</p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedCar(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Insurance Type
                </label>
                <select
                  value={bookingData.insuranceType}
                  onChange={(e) => setBookingData(prev => ({ ...prev, insuranceType: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={bookingData.couponCode}
                  onChange={(e) => setBookingData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {bookingData.startDate && bookingData.endDate && (
                <Card className="bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">Total Price:</span>
                    <span className="text-2xl font-bold text-cyan-400">{calculateTotalPrice()} TND</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} days × {selectedCar.prixParJour} TND/day
                  </p>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedCar(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleBookCar}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BrowseCars;
