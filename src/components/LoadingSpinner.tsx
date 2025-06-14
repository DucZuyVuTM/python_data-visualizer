import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Initializing Python Environment
            </h3>
            <p className="text-gray-600 text-sm">
              {message}
            </p>
            <div className="mt-4 text-xs text-gray-500">
              Loading NumPy, Matplotlib, and Pandas...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;