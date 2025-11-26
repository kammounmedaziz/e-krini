import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '@api/feedbackAPI';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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

const FeedbackComplaints = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);
  const [formData, setFormData] = useState({
    type: 'feedback',
    category: 'service_quality',
    priority: 'medium',
    subject: '',
    description: '',
    isAnonymous: false,
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchFeedback();
  }, [filters]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getMyFeedback(filters);
      setFeedbackList(response.data.feedback);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load feedback');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await feedbackAPI.createFeedback(formData);
      toast.success('Feedback submitted successfully!');
      setShowCreateModal(false);
      setFormData({
        type: 'feedback',
        category: 'service_quality',
        priority: 'medium',
        subject: '',
        description: '',
        isAnonymous: false,
      });
      fetchFeedback();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      await feedbackAPI.deleteFeedback(id);
      toast.success('Feedback deleted successfully');
      fetchFeedback();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete feedback');
    }
  };

  const handleRate = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await feedbackAPI.rateFeedback(selectedFeedback._id, rating);
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(0);
      fetchFeedback();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit rating');
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await feedbackAPI.getFeedbackById(id);
      setSelectedFeedback(response.data.feedback);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load feedback details');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Feedback & Complaints
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Submit and track your feedback, complaints, and suggestions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Submit Feedback
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <button
            onClick={() => setFilters({ status: '', type: '', page: 1, limit: 10 })}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
            Clear Filters
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
            No Feedback Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Submit your first feedback, complaint, or suggestion
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item) => {
            const TypeIcon = FEEDBACK_TYPES[item.type].icon;
            return (
              <div
                key={item._id}
                className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
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
                        <span>{CATEGORIES.find(c => c.value === item.category)?.label}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        {item.response && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">Responded</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewDetails(item._id)}
                      className="p-2 text-gray-600 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {(item.status === 'resolved' || item.status === 'closed') && !item.resolution?.satisfactionRating && (
                      <button
                        onClick={() => {
                          setSelectedFeedback(item);
                          setShowRatingModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
                        title="Rate Resolution"
                      >
                        <StarIcon className="w-5 h-5" />
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            {/* Close button - absolutely positioned */}
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-600 dark:text-gray-300 p-3 rounded-full shadow-lg border-2 border-gray-300 dark:border-dark-600 transition-all duration-200 hover:scale-110"
              title="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="pt-16 pb-6 px-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Submit Feedback
              </h2>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    required
                  >
                    {Object.entries(FEEDBACK_TYPES).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    required
                  >
                    {PRIORITIES.map((pr) => (
                      <option key={pr.value} value={pr.value}>{pr.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Brief summary of your feedback"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  rows={5}
                  placeholder="Provide detailed information..."
                  required
                  maxLength={2000}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                  Submit anonymously
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-20" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button Outside Modal */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-2xl border-4 border-white transition-all duration-200 hover:scale-110 z-10"
              title="Close"
              style={{ fontSize: '20px', fontWeight: 'bold' }}
            >
              ✕
            </button>

            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-6 rounded-t-lg z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Feedback Details
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
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

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedFeedback.subject}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedFeedback.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Your Rating:
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`w-5 h-5 ${
                              star <= selectedFeedback.resolution.satisfactionRating
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowRatingModal(false); setRating(0); }}>
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 dark:border-dark-700 p-6 flex justify-between items-start rounded-t-lg">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rate Resolution
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  How satisfied are you with how your {selectedFeedback.type} was resolved?
                </p>
              </div>
              <button
                onClick={() => { setShowRatingModal(false); setRating(0); }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors border border-transparent hover:border-gray-300 dark:hover:border-dark-600 ml-4"
                title="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarIconSolid className="w-12 h-12 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRating(0);
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRate}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackComplaints;
