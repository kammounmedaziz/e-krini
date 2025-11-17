import React, { useState } from 'react';
import ClientSidebar from '../../components/client/ClientSidebar';
import ClientSettings from './ClientSettings';
import { Card } from '@ui';
import {
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Star,
  AlertCircle,
  CreditCard,
  List,
  Home,
  Settings,
  MessageSquare
} from 'lucide-react';

// Placeholder components - these can be expanded later
const ActiveCards = () => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-4 text-white">Active Cards</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Primary Card</h3>
            <p className="text-cyan-300">**** **** **** 1234</p>
          </div>
          <CreditCard className="w-8 h-8 text-cyan-300" />
        </div>
      </Card>
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Business Card</h3>
            <p className="text-cyan-300">**** **** **** 5678</p>
          </div>
          <CreditCard className="w-8 h-8 text-cyan-300" />
        </div>
      </Card>
    </div>
  </div>
);

const TransactionsList = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4 text-white">Recent Transactions</h2>
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Payment Received</h4>
              <p className="text-sm text-gray-300">From BMW X5 rental</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-400">+$180.00</p>
            <p className="text-xs text-gray-400">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Car className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Car Rental</h4>
              <p className="text-sm text-gray-300">Mercedes C-Class</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-red-400">-$95.00</p>
            <p className="text-xs text-gray-400">1 day ago</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const CardManagement = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6 text-white">Card Management</h1>
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
      <p className="text-gray-300">Card management functionality will be implemented here.</p>
    </Card>
  </div>
);

const ManualPayment = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-6 text-white">Manual Payment</h1>
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
      <p className="text-gray-300">Manual payment functionality will be implemented here.</p>
    </Card>
  </div>
);

const ClientDashboard = ({ user, onLogout }) => {
  const [current, setCurrent] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const stats = [
    {
      title: 'Active Reservations',
      value: '3',
      icon: Car,
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/20'
    },
    {
      title: 'Total Spent',
      value: '$2,450',
      icon: DollarSign,
      color: 'text-green-300',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Upcoming Trips',
      value: '2',
      icon: Calendar,
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Loyalty Points',
      value: '1,250',
      icon: Star,
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  const recentReservations = [
    {
      id: 1,
      car: 'BMW X5 2024',
      location: 'Tunis Airport',
      dates: 'Dec 15-20, 2024',
      status: 'confirmed',
      price: '$180/day'
    },
    {
      id: 2,
      car: 'Mercedes C-Class',
      location: 'Downtown Tunis',
      dates: 'Jan 5-8, 2025',
      status: 'pending',
      price: '$95/day'
    },
    {
      id: 3,
      car: 'Audi Q7',
      location: 'Sousse Port',
      dates: 'Feb 10-15, 2025',
      status: 'confirmed',
      price: '$220/day'
    }
  ];

  const renderContent = () => {
    switch (current) {
      case 'dashboard':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-4 text-white">My Dashboard</h1>

            {/* Currency Information Banner */}
            <div className="mb-6 backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-cyan-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white mb-1">Currency Information</h3>
                  <p className="text-cyan-100 text-sm">
                    Our smart bus system uses <span className="font-bold text-cyan-300">T-Pay</span> coins as currency.
                  </p>
                  <p className="text-cyan-200 text-sm mt-1">
                    💰 <span className="font-semibold">Conversion Rate:</span> 1 DT (Dinar) = 1 T-Pay
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => (
                <Card key={index} className="backdrop-blur-lg bg-white/10 border border-white/20 text-center">
                  <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {stat.title}
                  </p>
                </Card>
              ))}
            </div>

            <ActiveCards />
            <TransactionsList />
          </div>
        );
      case 'cars':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">My Cars</h1>
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
              <p className="text-gray-300">Car management functionality will be implemented here.</p>
            </Card>
          </div>
        );
      case 'reservations':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">My Reservations</h1>
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Car className="w-5 h-5 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {reservation.car}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {reservation.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {reservation.dates}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {reservation.status}
                      </span>
                      <p className="text-sm font-semibold text-white mt-1">
                        {reservation.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      case 'payments':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Payment History</h1>
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
              <p className="text-gray-300">Payment history will be displayed here.</p>
            </Card>
          </div>
        );
      case 'locations':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Locations</h1>
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
              <p className="text-gray-300">Location services will be implemented here.</p>
            </Card>
          </div>
        );
      case 'reviews':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">My Reviews</h1>
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
              <p className="text-gray-300">Review management will be implemented here.</p>
            </Card>
          </div>
        );
      case 'support':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6 text-white">Support</h1>
            <Card className="backdrop-blur-lg bg-white/10 border border-white/20">
              <p className="text-gray-300">Support tickets and help will be available here.</p>
            </Card>
          </div>
        );
      case 'settings':
        return <ClientSettings />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 text-white">
      <div className="flex">
        <ClientSidebar
          current={current}
          setCurrent={setCurrent}
          isExpanded={isSidebarExpanded}
          toggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)}
          onLogout={onLogout}
        />
        <main className={`flex-1 min-h-screen overflow-y-auto ${isSidebarExpanded ? 'ml-64' : 'ml-24'} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
          <div className="p-6">
            <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl border border-gray-700 p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;