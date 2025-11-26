import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  Ban,
  CheckCircle,
  Edit,
  Eye,
  MoreVertical,
  RefreshCw,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { adminAPI } from '@api';
import toast from 'react-hot-toast';
import UserDetailsModal from '../../components/admin/UserDetailsModal';
import BulkActionsBar from '../../components/admin/BulkActionsBar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    kycStatus: '',
    isBanned: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(filters);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Select/Deselect users
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  // User actions
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setShowActionMenu(null);
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await adminAPI.banUser(userId, reason);
      toast.success('User banned successfully');
      
      // Update local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isBanned: true, banReason: reason, bannedAt: new Date() }
            : user
        )
      );
      
      await fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminAPI.unbanUser(userId);
      toast.success('User unbanned successfully');
      
      // Update local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isBanned: false, banReason: null, bannedAt: null, bannedBy: null }
            : user
        )
      );
      
      await fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to unban user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const roles = ['client', 'admin', 'agency'];
    const newRole = prompt(`Enter new role (${roles.join(', ')}):`, currentRole);
    
    if (!newRole || !roles.includes(newRole)) {
      toast.error('Invalid role');
      return;
    }

    try {
      await adminAPI.changeUserRole(userId, newRole);
      toast.success('User role changed successfully');
      fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to change role');
    }
  };

  // Export users
  const handleExport = async () => {
    try {
      const blob = await adminAPI.exportUsersToCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedUsers.length} selected users? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.bulkDeleteUsers(selectedUsers);
      toast.success('Users deleted successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete users');
    }
  };

  const handleBulkBan = async () => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await adminAPI.bulkBanUsers(selectedUsers, reason);
      toast.success('Users banned successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to ban users');
    }
  };

  const handleBulkChangeRole = async () => {
    const roles = ['client', 'admin', 'agency'];
    const newRole = prompt(`Enter role (${roles.join(', ')}):`);
    
    if (!newRole || !roles.includes(newRole)) {
      toast.error('Invalid role');
      return;
    }

    try {
      await adminAPI.bulkUpdateRole(selectedUsers, newRole);
      toast.success('User roles updated successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update roles');
    }
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      agency: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      client: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[role] || colors.client;
  };

  // Get KYC badge color
  const getKycBadge = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
            <option value="agency">Agency</option>
          </select>

          {/* KYC Status Filter */}
          <select
            value={filters.kycStatus}
            onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All KYC Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Ban Status Filter */}
          <select
            value={filters.isBanned}
            onChange={(e) => handleFilterChange('isBanned', e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onDelete={handleBulkDelete}
          onBan={handleBulkBan}
          onChangeRole={handleBulkChangeRole}
          onClear={() => setSelectedUsers([])}
        />
      )}

      {/* Users Table */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  KYC Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKycBadge(user.kycStatus)}`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned === true ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                          <UserX className="w-3 h-3" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      {/* Debug: Show actual isBanned value */}
                      {/* <div className="text-xs text-gray-400 mt-1">
                        isBanned: {JSON.stringify(user.isBanned)} ({typeof user.isBanned})
                      </div> */}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === user._id ? null : user._id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        {showActionMenu === user._id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setShowActionMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-600 z-40 py-1">
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleChangeRole(user._id, user.role)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Change Role
                              </button>
                              {user.isBanned === true ? (
                                <button
                                  onClick={() => handleUnbanUser(user._id)}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Unban User
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanUser(user._id)}
                                  className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                                >
                                  <Ban className="w-4 h-4" />
                                  Ban User
                                </button>
                              )}
                              {/* Debug: Show conditional logic */}
                              {/* <div className="px-4 py-1 text-xs text-gray-500">
                                Condition: {user.isBanned === true ? 'TRUE (show unban)' : 'FALSE (show ban)'}
                              </div> */}
                              <div className="border-t border-gray-200 dark:border-dark-600 my-1" />
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="px-4 py-3 border-t border-white/20 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * filters.limit, pagination.totalUsers)} of{' '}
              {pagination.totalUsers} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                  const pageNum = pagination.currentPage - 2 + idx;
                  if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl transition-colors ${
                        pagination.currentPage === pageNum
                          ? 'bg-primary-500 text-white'
                          : 'backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;
