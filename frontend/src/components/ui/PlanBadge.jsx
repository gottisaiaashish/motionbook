import React from 'react';

const PlanBadge = ({ planType, planName }) => {
  // Define styles based on plan type
  const getBadgeStyle = () => {
    switch (planType?.toLowerCase()) {
      case 'demo':
        return 'bg-gray-800 text-gray-300 border-gray-600';
      case 'user':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'photographer':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'referral':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      {planName || 'Free Plan'}
    </span>
  );
};

export default PlanBadge;
