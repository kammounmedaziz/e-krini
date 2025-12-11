import React, { useState, useEffect } from 'react';
import { promotionAPI } from '@api';
import { Card, Button } from '@ui';
import { Tag, Plus, Edit, X, Calendar, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('promotions');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promoRes, couponRes] = await Promise.all([
        promotionAPI.getActivePromotions(),
        promotionAPI.getCoupons()
      ]);
      setPromotions(promoRes.data || []);
      setCoupons(couponRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Promotions & Coupons</h1>
            <p className="text-gray-300">Manage system-wide promotions and coupons</p>
          </div>
          <Button variant="primary">
            <Plus className="w-5 h-5" />
            Create New
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'promotions'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            <Percent className="inline w-5 h-5 mr-2" />
            Promotions ({promotions.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'coupons'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            <Tag className="inline w-5 h-5 mr-2" />
            Coupons ({coupons.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : activeTab === 'promotions' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(promo => (
              <Card
                key={promo._id}
                className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{promo.name}</h3>
                    <p className="text-gray-400 text-sm">{promo.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue} TND`}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map(coupon => (
              <Card
                key={coupon._id}
                className="backdrop-blur-lg bg-white/10 border border-white/20 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{coupon.code}</h3>
                    <p className="text-gray-400 text-sm">{coupon.description}</p>
                  </div>
                  <div className="text-lg font-bold text-purple-400">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} TND`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-gray-400">Usage</div>
                    <div className="text-white font-medium">{coupon.usageCount}/{coupon.maxUsage}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Expires</div>
                    <div className="text-white font-medium">{new Date(coupon.expiryDate).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
