import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

const InstructorVerification = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchPendingInstructors();
  }, []);

  const fetchPendingInstructors = async () => {
    try {
      const response = await axios.get('/api/users/pending-verification');
      setInstructors(response.data);
    } catch (error) {
      console.error('Error fetching pending instructors:', error);
      toast.error('Failed to fetch pending instructors');
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async (instructorId, documentId, verified, comments = '') => {
    try {
      setVerifying(true);
      const response = await axios.put(`/api/users/${instructorId}/verify-document/${documentId}`, {
        verified,
        comments
      });

      toast.success(`Document ${verified ? 'verified' : 'rejected'} successfully`);
      
      // Refresh the pending instructors list first
      await fetchPendingInstructors();
      
      // Force refresh of selected instructor details to ensure UI updates
      if (selectedInstructor?._id === instructorId) {
        try {
          const refreshResponse = await axios.get(`/api/users/${instructorId}/profile`);
          setSelectedInstructor(refreshResponse.data);
          console.log('Updated instructor data:', refreshResponse.data); // Debug log
        } catch (refreshError) {
          console.error('Error refreshing instructor data:', refreshError);
          // Fallback: update the local state manually
          setSelectedInstructor(prev => {
            if (!prev) return prev;
            const updatedDocs = prev.instructorProfile.documents.map(doc => 
              doc._id === documentId 
                ? { ...doc, verified, comments, verifiedBy: response.data.document.verifiedBy, verifiedAt: new Date() }
                : doc
            );
            return {
              ...prev,
              instructorProfile: {
                ...prev.instructorProfile,
                documents: updatedDocs
              }
            };
          });
        }
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to update document verification');
    } finally {
      setVerifying(false);
    }
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

  const getQualificationLabel = (qual) => {
    const labels = {
      bachelors: "Bachelor's Degree",
      masters: "Master's Degree",
      phd: 'PhD',
      diploma: 'Diploma',
      certificate: 'Professional Certificate'
    };
    return labels[qual] || qual;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructor Verification</h1>
        <p className="mt-2 text-gray-600">
          Review instructor qualifications and documents for approval
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instructor List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Verification ({instructors.length})
            </h2>
            
            {instructors.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No instructors pending verification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {instructors.map((instructor) => (
                  <div
                    key={instructor._id}
                    onClick={() => setSelectedInstructor(instructor)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedInstructor?._id === instructor._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {instructor.firstName} {instructor.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{instructor.email}</p>
                        <p className="text-xs text-gray-500">
                          {instructor.instructorProfile?.documents?.length || 0} documents
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {instructor.isApproved ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructor Details */}
        <div className="lg:col-span-2">
          {selectedInstructor ? (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Personal Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedInstructor.firstName} {selectedInstructor.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedInstructor.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedInstructor.phone || 'Not provided'}</p>
                      <p><span className="font-medium">Registration:</span> {formatDate(selectedInstructor.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Qualifications</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Education:</span> {getQualificationLabel(selectedInstructor.instructorProfile?.qualification)}</p>
                      <p><span className="font-medium">Experience:</span> {selectedInstructor.instructorProfile?.experience || 0} years</p>
                      {selectedInstructor.instructorProfile?.linkedIn && (
                        <p><span className="font-medium">LinkedIn:</span> 
                          <a href={selectedInstructor.instructorProfile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                            View Profile
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedInstructor.instructorProfile?.bio && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                    <p className="text-sm text-gray-600">{selectedInstructor.instructorProfile.bio}</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
                
                {selectedInstructor.instructorProfile?.documents?.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedInstructor.instructorProfile?.documents?.map((document) => (
                      <div key={document._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {getDocumentTypeLabel(document.type)}
                            </h4>
                            <p className="text-sm text-gray-600">{document.originalName}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {formatDate(document.uploadDate)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <a
                              href={`http://localhost:5000/${document.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </a>
                            
                            {document.verified === true ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircleIcon className="h-5 w-5 mr-1" />
                                <span className="text-sm">Approved</span>
                              </div>
                            ) : (document.verified === false && document.verifiedAt) ? (
                              <div className="flex items-center text-red-600">
                                <XCircleIcon className="h-5 w-5 mr-1" />
                                <span className="text-sm">Rejected</span>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => verifyDocument(selectedInstructor._id, document._id, true)}
                                  disabled={verifying}
                                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Please enter the reason for rejection:');
                                    if (reason !== null && reason.trim() !== '') {
                                      verifyDocument(selectedInstructor._id, document._id, false, reason.trim());
                                    } else if (reason === '') {
                                      toast.error('Rejection reason is required');
                                    }
                                  }}
                                  disabled={verifying}
                                  className="btn btn-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                  <XCircleIcon className="h-4 w-4 mr-1" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {document.comments && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <span className="font-medium">Comments:</span> {document.comments}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select an instructor to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorVerification;
