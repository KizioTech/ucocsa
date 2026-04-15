import React from 'react';
import { Music } from 'lucide-react';

const EmptyState = ({ icon: Icon = Music, message, action }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Icon className="h-16 w-16 text-gray-400 mb-4" aria-hidden="true" />
    <p className="text-lg text-gray-600 mb-4">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;