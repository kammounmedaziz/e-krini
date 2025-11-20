import React from 'react';
import { Trash2, Ban, Shield, X } from 'lucide-react';

const BulkActionsBar = ({ selectedCount, onDelete, onBan, onChangeRole, onClear }) => {
  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="h-6 w-px bg-primary-300 dark:bg-primary-700" />
          <div className="flex gap-2">
            <button
              onClick={onChangeRole}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-800 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-700 transition-colors text-sm font-medium text-primary-900 dark:text-primary-100"
            >
              <Shield className="w-4 h-4" />
              Change Role
            </button>
            <button
              onClick={onBan}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-800 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-orange-100 dark:hover:bg-dark-700 transition-colors text-sm font-medium text-orange-600 dark:text-orange-400"
            >
              <Ban className="w-4 h-4" />
              Ban Users
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-800 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-red-100 dark:hover:bg-dark-700 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-2 hover:bg-primary-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-primary-700 dark:text-primary-300" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
