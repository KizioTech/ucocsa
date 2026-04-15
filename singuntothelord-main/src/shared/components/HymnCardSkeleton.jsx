import React from 'react';

const HymnCardSkeleton = () => (
  <div className="p-6 rounded-lg border-2 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-8 w-16 bg-gray-300 rounded"></div>
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
    </div>
    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-300 rounded mb-3"></div>
    <div className="h-4 w-full bg-gray-300 rounded"></div>
  </div>
);

export default HymnCardSkeleton;