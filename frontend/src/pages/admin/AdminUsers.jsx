import React from 'react';
import { Card } from '@ui';
import { Users, User } from 'lucide-react';

const AdminUsers = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-300">System-wide user overview</p>
        </div>

        <Card className="backdrop-blur-lg bg-white/10 border border-white/20 text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">User management features coming soon</p>
          <p className="text-gray-400 text-sm mt-2">View and manage all users (clients, agencies, insurance providers)</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
