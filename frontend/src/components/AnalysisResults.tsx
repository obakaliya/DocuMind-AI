import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  UserIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface DocumentData {
  id: number;
  filename: string;
  file_size: number;
  status: string;
  created_at: string;
}

interface AnalysisData {
  summary: string;
  parties: Array<{
    name: string;
    role: string;
    type: string;
  }>;
  dates: Array<{
    type: string;
    date: string;
    description: string;
    importance: string;
  }>;
  financial_terms: Array<{
    type: string;
    amount: number;
    currency: string;
    description: string;
    due_date?: string;
  }>;
  obligations: Array<{
    party: string;
    obligation: string;
    priority: string;
    deadline?: string;
  }>;
  risks: Array<{
    type: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  termination_conditions: string[];
  confidence_score: number;
}

interface AnalysisResultsProps {
  document: DocumentData;
  analysis: AnalysisData;
  onClose: () => void;
}

type TabType = 'summary' | 'parties' | 'dates' | 'financial' | 'obligations' | 'risks' | 'termination';

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  document,
  analysis,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType; name: string; count?: number }[] = [
    { id: 'summary', name: 'Summary' },
    { id: 'parties', name: 'Parties', count: analysis.parties.length },
    { id: 'dates', name: 'Dates', count: analysis.dates.length },
    { id: 'financial', name: 'Financial', count: analysis.financial_terms.length },
    { id: 'obligations', name: 'Obligations', count: analysis.obligations.length },
    { id: 'risks', name: 'Risks', count: analysis.risks.length },
    { id: 'termination', name: 'Termination', count: analysis.termination_conditions.length }
  ];

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Handle invalid currency codes or percentage values
    if (!currency || currency === '%' || currency.length !== 3) {
      // If it's a percentage or invalid currency, format as number with the symbol
      return `${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}${currency || ''}`;
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
      }).format(amount);
    } catch (error) {
      // Fallback for any other currency formatting errors
      return `${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} ${currency.toUpperCase()}`;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Document Summary</h4>
              <p className="text-blue-800">{analysis.summary}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                <span className="text-lg font-semibold text-primary-600">
                  {Math.round(analysis.confidence_score * 100)}%
                </span>
              </div>
            </div>
          </div>
        );

      case 'parties':
        return (
          <div className="space-y-3">
            {analysis.parties.map((party, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{typeof party.name === 'string' ? party.name : JSON.stringify(party.name)}</h4>
                    <p className="text-sm text-gray-600">{typeof party.role === 'string' ? party.role : JSON.stringify(party.role)}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {typeof party.type === 'string' ? party.type : JSON.stringify(party.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'dates':
        return (
          <div className="space-y-3">
            {analysis.dates.map((date, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{typeof date.type === 'string' ? date.type : JSON.stringify(date.type)}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImportanceColor(typeof date.importance === 'string' ? date.importance : 'unknown')}`}>
                    {typeof date.importance === 'string' ? date.importance : 'unknown'} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{typeof date.description === 'string' ? date.description : JSON.stringify(date.description)}</p>
                <p className="text-sm font-medium text-primary-600">{formatDate(date.date)}</p>
              </div>
            ))}
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-3">
            {analysis.financial_terms.map((term, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{typeof term.type === 'string' ? term.type : JSON.stringify(term.type)}</h4>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(term.amount, typeof term.currency === 'string' ? term.currency : 'USD')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{typeof term.description === 'string' ? term.description : JSON.stringify(term.description)}</p>
                {term.due_date && (
                  <p className="text-sm text-primary-600">Due: {formatDate(term.due_date)}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'obligations':
        return (
          <div className="space-y-3">
            {analysis.obligations.map((obligation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{typeof obligation.party === 'string' ? obligation.party : JSON.stringify(obligation.party)}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanceColor(typeof obligation.priority === 'string' ? obligation.priority : 'unknown')}`}>
                    {typeof obligation.priority === 'string' ? obligation.priority : 'unknown'} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{typeof obligation.obligation === 'string' ? obligation.obligation : JSON.stringify(obligation.obligation)}</p>
                {obligation.deadline && (
                  <p className="text-sm text-primary-600">Deadline: {formatDate(obligation.deadline)}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-3">
            {analysis.risks.map((risk, index) => (
              <div key={index} className={`border rounded-lg p-3 ${getRiskColor(risk.severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{typeof risk.type === 'string' ? risk.type : JSON.stringify(risk.type)}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(risk.severity)}`}>
                    {typeof risk.severity === 'string' ? risk.severity : 'unknown'} risk
                  </span>
                </div>
                <p className="text-sm mb-2">{typeof risk.description === 'string' ? risk.description : JSON.stringify(risk.description)}</p>
                <div className="bg-white bg-opacity-50 rounded p-2">
                  <p className="text-xs font-medium mb-1">Recommendation:</p>
                  <p className="text-xs">{typeof risk.recommendation === 'string' ? risk.recommendation : JSON.stringify(risk.recommendation)}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'termination':
        return (
          <div className="space-y-3">
            {Array.isArray(analysis.termination_conditions) ? (
              analysis.termination_conditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      {typeof condition === 'string' ? (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Termination Condition</h4>
                          <p className="text-sm text-gray-600">{condition}</p>
                        </div>
                      ) : typeof condition === 'object' && condition !== null ? (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Termination Condition</h4>
                          <div className="space-y-2">
                            {Object.entries(condition).map(([key, value], i) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-gray-600 ml-1">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Termination Condition</h4>
                          <p className="text-sm text-gray-600">{JSON.stringify(condition)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Termination Conditions</h4>
                    <p className="text-sm text-gray-600">
                      {typeof analysis.termination_conditions === 'string' 
                        ? analysis.termination_conditions 
                        : JSON.stringify(analysis.termination_conditions)
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
          <p className="text-sm text-gray-500">{document.filename}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== undefined && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AnalysisResults; 