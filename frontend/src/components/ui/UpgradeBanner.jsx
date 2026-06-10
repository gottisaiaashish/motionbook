import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UpgradeBanner = ({ reason, storagePercentage }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  let title = '';
  let message = '';
  let type = 'warning'; // 'warning' or 'danger'

  switch (reason) {
    case 'demo_expiring_soon':
      title = 'Demo Expiring Soon';
      message = 'Your demo plan is expiring soon. Upgrade now to keep your albums and continue uploading.';
      type = 'warning';
      break;
    case 'demo_expired':
      title = 'Demo Expired';
      message = 'Your demo plan has expired. Please upgrade your plan to access premium features and upload more.';
      type = 'danger';
      break;
    case 'storage_full':
      title = 'Storage Limit Reached';
      message = 'You have used all your available storage. Please upgrade to a larger plan.';
      type = 'danger';
      break;
    case 'storage_almost_full':
      title = 'Storage Almost Full';
      message = `You have used ${storagePercentage?.toFixed(0)}% of your storage limit. Consider upgrading soon.`;
      type = 'warning';
      break;
    default:
      return null;
  }

  const bgColor = type === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10';
  const borderColor = type === 'danger' ? 'border-red-500/30' : 'border-yellow-500/30';
  const textColor = type === 'danger' ? 'text-red-400' : 'text-yellow-400';
  const iconColor = type === 'danger' ? 'text-red-500' : 'text-yellow-500';
  const buttonBg = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

  return (
    <div className={`border ${borderColor} ${bgColor} p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6`}>
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mt-0.5 flex-shrink-0 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          <p className="text-gray-300 text-sm mt-1">{message}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => navigate('/pricing')}
          className={`${buttonBg} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap w-full sm:w-auto text-center`}
        >
          Upgrade Plan
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UpgradeBanner;
