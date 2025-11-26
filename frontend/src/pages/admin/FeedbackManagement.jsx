import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '@api/feedbackAPI';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const FEEDBACK_TYPES = {
  feedback: { icon: ChatBubbleLeftRightIcon, label: 'Feedback', color: 'blue' },
  complaint: { icon: ExclamationTriangleIcon, label: 'Complaint', color: 'red' },
  report: { icon: DocumentTextIcon, label: 'Report', color: 'yellow' },
  suggestion: { icon: LightBulbIcon, label: 'Suggestion', color: 'green' },
};

const CATEGORIES = [
  { value: 'service_quality', label: 'Service Quality' },
  { value: 'vehicle_issue', label: 'Vehicle Issue' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'booking_issue', label: 'Booking Issue' },
  { value: 'insurance_issue', label: 'Insurance Issue' },
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const STATUS_COLORS = {
  pending: 'yellow',
  in_progress: 'blue',
  resolved: 'green',
  closed: 'gray',
  rejected: 'red',
};

const FeedbackManagement = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    category: '',
    priority: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
  });

  useEffect(() => {
    fetchFeedback();
    fetchStatistics();
  }, [filters]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAllFeedback(filters);
      setFeedbackList(response.data.feedback);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load feedback');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await feedbackAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await feedbackAPI.getFeedbackById(id);
      setSelectedFeedback(response.data.feedback);
      setUpdateData({
        status: response.data.feedback.status,
        priority: response.data.feedback.priority,
      });
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load feedback details');
    }
  };

  const handleUpdate = async () => {
    try {
      await feedbackAPI.updateFeedback(selectedFeedback._id, updateData);
      toast.success('Feedback updated successfully');
      fetchFeedback();
      setShowDetailsModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update feedback');
    }
  };

  const handleAction = async (type) => {
    setActionType(type);
    setActionMessage('');
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (!actionMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      if (actionType === 'respond') {
        await feedbackAPI.respondToFeedback(selectedFeedback._id, actionMessage);
        toast.success('Response added successfully');
      } else if (actionType === 'resolve') {
        await feedbackAPI.resolveFeedback(selectedFeedback._id, actionMessage);
        toast.success('Feedback resolved successfully');
      } else if (actionType === 'note') {
        await feedbackAPI.addInternalNote(selectedFeedback._id, actionMessage);
        toast.success('Internal note added successfully');
      }
      
      setShowActionModal(false);
      setActionMessage('');
      fetchFeedback();
      
      // Refresh details if modal is open
      if (showDetailsModal) {
        viewDetails(selectedFeedback._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || `Failed to ${actionType}`);
    }
  };

  const getPriorityColor = (priority) => {
    const p = PRIORITIES.find(pr => pr.value === priority);
    return p ? p.color : 'gray';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Feedback Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all feedback, complaints, and suggestions from users
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Feedback</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.totalFeedback}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.byStatus.pending || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.byStatus.resolved || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.averageRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {Object.entries(FEEDBACK_TYPES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((pr) => (
              <option key={pr.value} value={pr.value}>{pr.label}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ status: '', type: '', category: '', priority: '', page: 1, limit: 10 })}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
            Clear
          </button>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-12 text-center">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Feedback Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No feedback matches your current filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item) => {
            const TypeIcon = FEEDBACK_TYPES[item.type].icon;
            return (
              <div
                key={item._id}
                className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => viewDetails(item._id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${FEEDBACK_TYPES[item.type].color}-100 dark:bg-${FEEDBACK_TYPES[item.type].color}-900/20`}>
                    <TypeIcon className={`w-6 h-6 text-${FEEDBACK_TYPES[item.type].color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.subject}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${STATUS_COLORS[item.status]}-100 text-${STATUS_COLORS[item.status]}-700 dark:bg-${STATUS_COLORS[item.status]}-900/20 dark:text-${STATUS_COLORS[item.status]}-400`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getPriorityColor(item.priority)}-100 text-${getPriorityColor(item.priority)}-700 dark:bg-${getPriorityColor(item.priority)}-900/20 dark:text-${getPriorityColor(item.priority)}-400`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>User: {item.userId}</span>
                      <span>•</span>
                      <span>{CATEGORIES.find(c => c.value === item.category)?.label}</span>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                      {item.response && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 dark:text-green-400">Responded</span>
                        </>
                      )}
                      {item.resolution && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400">Resolved</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            {/* BIG RED CLOSE BUTTON - Always visible */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute -top-3 -right-3 z-20 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl border-4 border-white dark:border-dark-800 transition-all duration-200 hover:scale-110 animate-pulse"
              title="CLOSE MODAL"
              style={{ fontSize: '24px', fontWeight: 'bold' }}
            >
              ✕
            </button>

            <div className="p-6 space-y-6">
              {/* Feedback Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${FEEDBACK_TYPES[selectedFeedback.type].color}-100 text-${FEEDBACK_TYPES[selectedFeedback.type].color}-700`}>
                    {FEEDBACK_TYPES[selectedFeedback.type].label}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${STATUS_COLORS[selectedFeedback.status]}-100 text-${STATUS_COLORS[selectedFeedback.status]}-700`}>
                    {selectedFeedback.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${getPriorityColor(selectedFeedback.priority)}-100 text-${getPriorityColor(selectedFeedback.priority)}-700`}>
                    {selectedFeedback.priority.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedFeedback.subject}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedFeedback.description}
                </p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedFeedback.userId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {CATEGORIES.find(c => c.value === selectedFeedback.category)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedFeedback.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Status & Priority */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Update Feedback
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={updateData.priority}
                      onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      {PRIORITIES.map((pr) => (
                        <option key={pr.value} value={pr.value}>{pr.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleUpdate}
                  className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Update
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('respond')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Response
                </button>
                <button
                  onClick={() => handleAction('resolve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Resolve Feedback
                </button>
                <button
                  onClick={() => handleAction('note')}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Internal Note
                </button>
              </div>

              {/* Response */}
              {selectedFeedback.response && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Response
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    {selectedFeedback.response.message}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    {formatDate(selectedFeedback.response.respondedAt)}
                  </p>
                </div>
              )}

              {/* Resolution */}
              {selectedFeedback.resolution && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                    Resolution
                  </h4>
                  <p className="text-green-800 dark:text-green-200">
                    {selectedFeedback.resolution.message}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Resolved on {formatDate(selectedFeedback.resolution.resolvedAt)}
                  </p>
                  {selectedFeedback.resolution.satisfactionRating && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Rating: {selectedFeedback.resolution.satisfactionRating}/5 stars
                    </p>
                  )}
                </div>
              )}

              {/* Internal Notes */}
              {selectedFeedback.internalNotes && selectedFeedback.internalNotes.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Internal Notes
                  </h4>
                  <div className="space-y-2">
                    {selectedFeedback.internalNotes.map((note) => (
                      <div key={note._id} className="text-sm">
                        <p className="text-purple-800 dark:text-purple-200">{note.note}</p>
                        <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">
                          {formatDate(note.addedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowActionModal(false); setActionMessage(''); }}>
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 dark:border-dark-700 p-6 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {actionType === 'respond' && 'Add Response'}
                {actionType === 'resolve' && 'Resolve Feedback'}
                {actionType === 'note' && 'Add Internal Note'}
              </h2>
              <button
                onClick={() => { setShowActionModal(false); setActionMessage(''); }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors border border-transparent hover:border-gray-300 dark:hover:border-dark-600"
                title="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <textarea
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                rows={6}
                placeholder={`Enter your ${actionType === 'note' ? 'note' : actionType === 'respond' ? 'response' : 'resolution message'}...`}
                maxLength={actionType === 'note' ? 500 : 1000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {actionMessage.length}/{actionType === 'note' ? 500 : 1000} characters
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setActionMessage('');
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
