import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { logger } from '../utils/logger';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleAnalyticsClick = () => {
    logger.info('Home: Analytics button clicked');
    navigate('/analytics');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Abnormal File Vault Manager</h1>
          <p className="text-gray-600">Choose an option to continue</p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/upload')}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            File Upload
          </button>
          <button
            onClick={handleAnalyticsClick}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 