import React, { useState, useEffect, useCallback } from 'react';
import { DocumentTextIcon, ChartBarIcon, UserIcon, ClockIcon, XCircleIcon, XMarkIcon, CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { documentsAPI, paymentsAPI } from '../services/api';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import AnalysisResults from './AnalysisResults';
import PlanUpgrade from './PlanUpgrade';
import { Document, Analysis } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleStripeRedirect = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      try {
        // Verify payment status and update user plan
        await paymentsAPI.verifyPaymentStatus(sessionId);
        setSuccess('Payment successful! Your Pro plan is now active.');
        await refreshUser(); // Refresh user data to show updated plan
      } catch (error) {
        console.error('Payment verification failed:', error);
        setSuccess('Payment successful! Your Pro plan will be activated shortly.');
        await refreshUser(); // Still refresh user data
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshUser]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getAll();
      setDocuments(response.documents);
    } catch (err: any) {
      // Handle authentication errors gracefully
      if (err.response?.status === 401) {
        console.error('Authentication error in fetchDocuments:', err);
        // Don't show error to user, let the auth interceptor handle it
        return;
      }
      setError(err.response?.data?.error || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    handleStripeRedirect();
  }, [fetchDocuments, handleStripeRedirect]);

  const handleDocumentUpload = async (file: File) => {
    try {
      setError(''); // Clear any existing errors
      setSuccess(''); // Clear any existing success messages
      
      const response = await documentsAPI.upload(file);
      setDocuments(prev => [response.document, ...prev]);
      
      // Refresh user data to update document count
      await refreshUser();
      
      setSuccess('Document uploaded successfully!');
      
      return response.document;
    } catch (err: any) {
      // Handle authentication errors gracefully
      if (err.response?.status === 401) {
        console.error('Authentication error in handleDocumentUpload:', err);
        // Don't show error to user, let the auth interceptor handle it
        throw err;
      }
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload document';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw for DocumentUpload component to handle
    }
  };

  const handleAnalyzeDocument = async (documentId: number) => {
    try {
      setError(''); // Clear any existing errors
      setSuccess(''); // Clear any existing success messages
      
      const response = await documentsAPI.analyze(documentId);
      setAnalysis(response.analysis);
      
      // Update document status in the list
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'completed', confidence_score: response.analysis.confidence_score }
            : doc
        )
      );
      
      // Refresh user data to update document count
      await refreshUser();
      
      setSuccess('Document analyzed successfully!');
    } catch (err: any) {
      // Handle authentication errors gracefully
      if (err.response?.status === 401) {
        console.error('Authentication error in handleAnalyzeDocument:', err);
        // Don't show error to user, let the auth interceptor handle it
        return;
      }
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze document';
      setError(errorMessage);
      
      // Update document status to failed if it was a limit error
      if (err.response?.status === 403) {
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'failed' }
              : doc
          )
        );
      }
    }
  };

  const handleViewResults = async (documentId: number) => {
    try {
      const response = await documentsAPI.getResults(documentId);
      setSelectedDocument(response.document);
      setAnalysis(response.analysis);
    } catch (err: any) {
      // Handle authentication errors gracefully
      if (err.response?.status === 401) {
        console.error('Authentication error in handleViewResults:', err);
        // Don't show error to user, let the auth interceptor handle it
        return;
      }
      setError(err.response?.data?.error || 'Failed to fetch analysis results');
    }
  };

  const clearError = () => {
    setError('');
  };

  const clearSuccess = () => {
    setSuccess('');
  };

  const handleUpgrade = (updatedUser: any) => {
    // Update the user in the auth context
    refreshUser();
    setShowUpgradeModal(false);
    setSuccess('Successfully upgraded to Pro plan!');
  };

  const handleBillingPortal = async () => {
    if (!user) {
      setError('User not found. Please sign in again.');
      return;
    }

    try {
      // Check if user has required Stripe data
      if (!user.stripe_customer_id || !user.stripe_subscription_id) {
        setError('No active subscription found. Please upgrade to Pro plan first.');
        return;
      }

      const response = await paymentsAPI.createPortalSession();
      
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err: any) {
      console.error('Billing portal error:', err);
      
      // Provide more specific error messages
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.error || 'No active subscription found';
        setError(`${errorMessage}. Please upgrade to Pro plan first.`);
      } else if (err.response?.status === 401) {
        setError('Authentication error. Please sign in again.');
      } else if (err.response?.status === 404) {
        setError('User not found in database. Please try signing in again.');
      } else if (err.response?.status === 503 && err.response?.data?.code === 'PORTAL_NOT_CONFIGURED') {
        setError('Billing portal is temporarily unavailable. Please try again later or contact support.');
      } else {
        const errorMessage = err.response?.data?.error || 'Failed to access billing portal';
        setError(`${errorMessage}. Please try again later.`);
      }
    }
  };

  // Auto-clear errors and success messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const getUsagePercentage = () => {
    if (!user) return 0;
    const limit = user.plan === 'free' ? 5 : Infinity;
    return limit === Infinity ? 0 : (user.documents_processed_this_month / limit) * 100;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DocuMind</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.name}
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Analyzed This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user.documents_processed_this_month}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plan</p>
                <p className="text-2xl font-semibold text-gray-900 capitalize">{user.plan}</p>
                {user.plan === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-2 text-xs bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    Upgrade to Pro
                  </button>
                )}
                {user.plan === 'pro' && (
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={handleBillingPortal}
                      className="w-full text-xs bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <CreditCardIcon className="h-3 w-3 mr-1" />
                      Manage Billing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usage</p>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {user.plan === 'free' ? `${user.documents_processed_this_month}/5` : 'Unlimited'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 ml-4"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{success}</span>
            </div>
            <button
              onClick={clearSuccess}
              className="text-green-400 hover:text-green-600 ml-4"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Upload and List */}
          <div className="lg:col-span-2 space-y-6">
            <DocumentUpload 
              onUpload={handleDocumentUpload}
              onAnalyze={handleAnalyzeDocument}
              userPlan={user.plan}
              documentsProcessed={user.documents_processed_this_month}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
            
            <DocumentList 
              documents={documents}
              loading={loading}
              onAnalyze={handleAnalyzeDocument}
              onViewResults={handleViewResults}
              onRefresh={fetchDocuments}
            />
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-1">
            {selectedDocument && analysis ? (
              <AnalysisResults 
                document={selectedDocument}
                analysis={analysis}
                onClose={() => {
                  setSelectedDocument(null);
                  setAnalysis(null);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
                <p className="text-gray-600">
                  Select a document to view its analysis results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Upgrade Modal */}
      {showUpgradeModal && (
        <PlanUpgrade
          user={user}
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 