import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { paymentsAPI } from '../services/api';
import { User } from '../types';

interface PlanUpgradeProps {
  user: User;
  onUpgrade: (updatedUser: User) => void;
  onClose: () => void;
}

const PlanUpgrade: React.FC<PlanUpgradeProps> = ({ user, onUpgrade, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await paymentsAPI.createCheckoutSession();
      
      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  if (user.plan === 'pro') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Already on Pro Plan</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                You are already subscribed to the Pro plan with unlimited document analysis.
              </p>
            </div>
            <div className="items-center px-4 py-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Upgrade to Pro Plan</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900">Pro Plan - $4.99/month</h4>
                  <p className="text-sm text-primary-700">Unlimited document analysis</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary-900">$4.99</span>
                  <span className="text-sm text-primary-600">/month</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h5 className="font-medium text-gray-900">Pro Plan Features:</h5>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Unlimited documents per month</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Advanced AI analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Risk assessment</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">API access</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Custom integrations</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redirecting...' : 'Upgrade Now'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              You'll be redirected to Stripe to complete your payment securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgrade; 