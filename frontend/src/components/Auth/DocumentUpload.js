import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CloudArrowUpIcon, DocumentIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documents, setDocuments] = useState([
    { type: 'degree_certificate', file: null, required: true, label: 'Degree Certificate' },
    { type: 'teaching_certificate', file: null, required: false, label: 'Teaching Certificate' },
    { type: 'id_proof', file: null, required: true, label: 'ID Proof' },
    { type: 'experience_letter', file: null, required: false, label: 'Experience Letter' }
  ]);

  // Show toast notification for document status changes
  useEffect(() => {
    if (user?.instructorProfile?.verificationStatus === 'rejected' && !isSubmitted) {
      toast.error('Your documents were rejected. Please upload new documents for verification.');
    } else if (user?.instructorProfile?.verificationStatus === 'approved') {
      toast.success('Your documents have been approved! Your instructor account is now active.');
    }
  }, [user?.instructorProfile?.verificationStatus, isSubmitted]);

  const handleFileChange = (index, file) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].file = file;
    setDocuments(updatedDocuments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check required documents
    const requiredDocs = documents.filter(doc => doc.required && !doc.file);
    if (requiredDocs.length > 0) {
      toast.error('Please upload all required documents');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      const documentTypes = [];

      documents.forEach(doc => {
        if (doc.file) {
          formData.append('documents', doc.file);
          documentTypes.push(doc.type);
        }
      });

      formData.append('documentTypes', JSON.stringify(documentTypes));

      await axios.post('/api/auth/upload-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Documents uploaded successfully! Your account is now under review.');
      
      // Set submitted state first for immediate UI update
      setIsSubmitted(true);
      
      // Refresh user data to get updated status with a small delay
      setTimeout(async () => {
        await refreshUser();
      }, 500);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  // Check if user already has documents uploaded or if just submitted
  const getDocumentStatus = () => {
    console.log('Checking document status:', {
      isSubmitted,
      documentsUploaded: user?.instructorProfile?.documentsUploaded,
      verificationStatus: user?.instructorProfile?.verificationStatus,
      user: user?.instructorProfile
    });
    
    // If just submitted in this session, show under_review
    if (isSubmitted) {
      return 'under_review';
    }
    
    // If user has previously uploaded documents, check their status
    if (user?.instructorProfile?.documentsUploaded) {
      return user.instructorProfile.verificationStatus || 'under_review';
    }
    
    return null;
  };

  // Get rejection reasons from documents or verification comments
  const getRejectionReasons = () => {
    const reasons = [];
    
    // Check individual document comments
    if (user?.instructorProfile?.documents) {
      user.instructorProfile.documents.forEach(doc => {
        if (!doc.verified && doc.comments) {
          reasons.push(`${getDocumentTypeLabel(doc.type)}: ${doc.comments}`);
        }
      });
    }
    
    // Check overall verification comments
    if (user?.instructorProfile?.verificationComments) {
      reasons.push(user.instructorProfile.verificationComments);
    }
    
    return reasons;
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      degree_certificate: 'Degree Certificate',
      teaching_certificate: 'Teaching Certificate',
      id_proof: 'ID Proof',
      experience_letter: 'Experience Letter',
      other: 'Other Document'
    };
    return labels[type] || type;
  };

  // Reset documents for reupload
  const handleReupload = async () => {
    try {
      setUploading(true);
      
      // Call backend to reset document status
      await axios.put('/api/users/reset-documents');
      
      // Reset local state
      setIsSubmitted(false);
      setDocuments([
        { type: 'degree_certificate', file: null, required: true, label: 'Degree Certificate' },
        { type: 'teaching_certificate', file: null, required: false, label: 'Teaching Certificate' },
        { type: 'id_proof', file: null, required: true, label: 'ID Proof' },
        { type: 'experience_letter', file: null, required: false, label: 'Experience Letter' }
      ]);
      
      // Refresh user data
      await refreshUser();
      
      toast.success('Ready for new document upload. Please select your documents.');
    } catch (error) {
      console.error('Error resetting documents:', error);
      toast.error('Failed to reset document status. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const documentStatus = getDocumentStatus();

  const renderStatusScreen = () => {
    let statusIcon, statusTitle, statusMessage, statusColor;
    const rejectionReasons = getRejectionReasons();

    switch (documentStatus) {
      case 'approved':
        statusIcon = <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />;
        statusTitle = 'Documents Approved';
        statusMessage = 'Congratulations! Your documents have been verified and your instructor account is now active.';
        statusColor = 'text-green-600';
        break;
      case 'rejected':
        statusIcon = <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />;
        statusTitle = 'Documents Rejected';
        statusMessage = 'Your documents were rejected. Please review the reasons below and upload new documents.';
        statusColor = 'text-red-600';
        break;
      default: // under_review or pending
        statusIcon = <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto" />;
        statusTitle = 'Documents Under Review';
        statusMessage = 'Your documents have been submitted and are currently being reviewed by our admin team. You will be notified once the review is complete.';
        statusColor = 'text-yellow-600';
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-lg text-center">
            {statusIcon}
            <h2 className={`mt-4 text-2xl font-bold ${statusColor}`}>
              {statusTitle}
            </h2>
            <p className="mt-4 text-gray-600">
              {statusMessage}
            </p>
            
            {/* Show rejection reasons */}
            {documentStatus === 'rejected' && rejectionReasons.length > 0 && (
              <div className="mt-6 text-left">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Rejection Reasons:</h3>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <ul className="text-sm text-red-800 space-y-2">
                    {rejectionReasons.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-8 space-y-4">
              {documentStatus === 'rejected' && (
                <button
                  onClick={handleReupload}
                  disabled={uploading}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {uploading ? 'Resetting...' : 'Reupload Documents'}
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full btn btn-secondary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show status screen if documents are submitted or already uploaded
  if (documentStatus) {
    return renderStatusScreen();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Upload Verification Documents
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Please upload the required documents for account verification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {documents.map((doc, index) => (
              <div key={doc.type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {doc.label}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {doc.file && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                    className="hidden"
                    id={`file-${index}`}
                  />
                  <label
                    htmlFor={`file-${index}`}
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {doc.file ? (
                      <div className="flex items-center">
                        <DocumentIcon className="h-8 w-8 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">{doc.file.name}</span>
                      </div>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload {doc.label.toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG, DOC (max 10MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Document Guidelines:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Documents should be clear and legible</li>
                <li>• Maximum file size: 10MB per document</li>
                <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                <li>• All information should be clearly visible</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
