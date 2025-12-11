import React, { useState, useEffect } from 'react';
import { promotionAPI } from '@api';
import { Card, Button } from '@ui';
import {
  Tag,
  Percent,
  Calendar,
  Check,
  X,
  Copy,
  Gift,
  Sparkles,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

const PromotionsCoupons = () => {
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('promotions');
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    fetchPromotions();
    fetchCoupons();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionAPI.getActivePromotions();
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await promotionAPI.getCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const response = await promotionAPI.validateCoupon(couponCode, {});
      if (response.success) {
        toast.success(`✓ Valid coupon! ${response.data.discountType === 'percentage' ? response.data.discountValue + '%' : response.data.discountValue + ' TND'} discount`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Invalid coupon code');
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard!');
  };

  const getDiscountDisplay = (promo) => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}% OFF`;
    } else {
      return `${promo.discountValue} TND OFF`;
    }
  };

  const isPromotionActive = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return now >= start && now <= end && promo.isActive;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Promotions & Coupons</h1>
          <p className="text-gray-300">Save money on your next car rental</p>
        </div>

        {/* Coupon Validator */}
        <Card className="mb-6 backdrop-blur-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <div className="flex items-center gap-4">
            <Gift className="w-12 h-12 text-cyan-400" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Have a Coupon Code?</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyCoupon()}
                />
                <Button variant="primary" onClick={handleVerifyCoupon}>
                  Verify
                </Button>
              </div>
            </div>
          </div>
        </Card>

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
            <Sparkles className="inline w-5 h-5 mr-2" />
            Active Promotions
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
            Available Coupons
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : activeTab === 'promotions' ? (
          // Promotions Grid
          promotions.length === 0 ? (
            <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No active promotions at the moment</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for amazing deals!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map(promo => (
                <Card 
                  key={promo._id} 
                  className={`backdrop-blur-lg border-2 transition-all hover:scale-105 ${
                    isPromotionActive(promo)
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  {/* Discount Badge */}
                  <div className="relative mb-4">
                    <div className="h-32 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Percent className="w-16 h-16 text-cyan-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-white">
                          {getDiscountDisplay(promo)}
                        </div>
                      </div>
                    </div>
                    {isPromotionActive(promo) && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        ACTIVE
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{promo.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{promo.description}</p>

                  {promo.category && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <Car className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-300">Applicable to: {promo.category}</span>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Valid from {new Date(promo.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Valid until {new Date(promo.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-400 text-center">
                      Automatically applied at checkout
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          // Coupons Grid
          coupons.length === 0 ? (
            <Card className="text-center py-12 backdrop-blur-lg bg-white/10 border border-white/20">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No coupons available</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.filter(c => c.isActive).map(coupon => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                const isMaxUsed = coupon.usageCount >= coupon.maxUsage;

                return (
                  <Card 
                    key={coupon._id} 
                    className={`backdrop-blur-lg border transition-all ${
                      isExpired || isMaxUsed
                        ? 'bg-gray-500/10 border-gray-500/30 opacity-60'
                        : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Tag className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{coupon.code}</h3>
                          <p className="text-sm text-gray-400">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}% discount`
                              : `${coupon.discountValue} TND off`}
                          </p>
                        </div>
                      </div>
                      {!isExpired && !isMaxUsed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCoupon(coupon.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <p className="text-gray-300 mb-4">{coupon.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>Valid until {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="text-purple-400">●</span>
                        <span>{coupon.maxUsage - coupon.usageCount} uses remaining</span>
                      </div>
                    </div>

                    {isExpired ? (
                      <div className="flex items-center gap-2 text-red-400 text-sm p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <X className="w-4 h-4" />
                        <span>Expired</span>
                      </div>
                    ) : isMaxUsed ? (
                      <div className="flex items-center gap-2 text-gray-400 text-sm p-2 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                        <X className="w-4 h-4" />
                        <span>All uses claimed</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-purple-300 font-medium">Coupon Code:</span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCopyCoupon(coupon.code)}
                          >
                            <Copy className="w-3 h-3" />
                            Copy Code
                          </Button>
                        </div>
                        <div className="font-mono text-xl text-center py-2 bg-white/10 rounded text-white border border-dashed border-purple-400">
                          {coupon.code}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        )}

        {/* Info Box */}
        <Card className="mt-8 backdrop-blur-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-4">
            <Gift className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">How to Use Promotions & Coupons</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Promotions</strong> are automatically applied when you book an eligible car</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Coupons</strong> can be entered during the booking process to get additional discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>You can combine promotions with coupon codes for maximum savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Check back regularly for new deals and special offers</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PromotionsCoupons;
