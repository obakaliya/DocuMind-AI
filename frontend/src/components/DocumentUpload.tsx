import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<DocumentData>;
  onAnalyze: (documentId: number) => Promise<void>;
  userPlan: 'free' | 'pro';
  documentsProcessed: number;
  onUpgrade?: () => void;
}

interface DocumentData {
  id: number;
  filename: string;
  file_size: number;
  status: string;
  created_at: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  onAnalyze,
  userPlan,
  documentsProcessed,
  onUpgrade
}) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<DocumentData | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError('');
    setUploading(true);

    try {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and Word documents are supported');
      }

      // Check plan limits
      if (userPlan === 'free' && documentsProcessed >= 5) {
        throw new Error('Monthly limit reached. Upgrade to Pro for unlimited document analysis.');
      }

      const document = await onUpload(file);
      setUploadedDocument(document);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, [onUpload, userPlan, documentsProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!uploadedDocument) return;

    setAnalyzing(uploadedDocument.id);
    try {
      await onAnalyze(uploadedDocument.id);
      setUploadedDocument(null);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleClear = () => {
    setUploadedDocument(null);
    setError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!uploadedDocument ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            {isDragActive ? (
              <p className="text-primary-600">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600">
                  Drag and drop a document here, or{' '}
                  <span className="text-primary-600 hover:text-primary-500">click to select</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports PDF and Word documents (max 10MB)
                </p>
              </div>
            )}
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="spinner mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{uploadedDocument.filename}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(uploadedDocument.file_size)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAnalyze}
                disabled={analyzing === uploadedDocument.id}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing === uploadedDocument.id ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze'
                )}
              </button>
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Usage Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Monthly Usage:</span>
          <span className="font-medium">
            {userPlan === 'free' ? (
              `${documentsProcessed}/5 documents`
            ) : (
              `${documentsProcessed} documents (unlimited)`
            )}
          </span>
        </div>
        {userPlan === 'free' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(documentsProcessed / 5) * 100}%` }}
              ></div>
            </div>
            {documentsProcessed >= 5 && (
              <div className="mt-2">
                <p className="text-xs text-red-600 mb-2">
                  Monthly limit reached. Consider upgrading to Pro.
                </p>
                {onUpgrade && (
                  <button
                    onClick={onUpgrade}
                    className="text-xs bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload; 