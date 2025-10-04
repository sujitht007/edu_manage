import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  DocumentTextIcon,
  ClockIcon,
  PaperClipIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDateLong, getTimeUntilDate, formatDateTime, isValidDate } from '../../utils/dateUtils';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    submissionText: '',
    attachments: []
  });

  useEffect(() => {
    fetchAssignmentDetails();
    if (user?.role === 'student') {
      fetchSubmission();
    }
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await axios.get(`/api/assignments/${id}`);
      setAssignment(response.data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Assignment not found');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/assignment/${id}/student/${user._id}`);
      setSubmission(response.data);
    } catch (error) {
      // No submission found - this is normal
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionForm(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionLoading(true);

    try {
      console.log('Submitting assignment with id:', id);
      await axios.post('/api/submissions', {
        assignmentId: id,
        submissionText: submissionForm.submissionText
      });

      toast.success('Assignment submitted successfully!');
      fetchSubmission(); // Refresh submission data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const isOverdue = assignment?.dueDate && isValidDate(assignment.dueDate) ? new Date() > new Date(assignment.dueDate) : false;
  const canSubmit = user?.role === 'student' && !submission && 
    (assignment?.allowLateSubmission || !isOverdue);

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date set';
    
    if (!isValidDate(dueDate)) return 'Invalid date';
    
    return formatDateLong(dueDate);
  };

  const getTimeUntilDue = (dueDate) => {
    return getTimeUntilDate(dueDate);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Assignment not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-gray-600">{assignment.course?.title} • {assignment.course?.courseCode}</p>
            </div>
          </div>
          
          {submission ? (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              <span className="font-medium">Submitted</span>
            </div>
          ) : isOverdue ? (
            <div className="flex items-center text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
              <span className="font-medium">Overdue</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <ClockIcon className="h-6 w-6 mr-2" />
              <span className="font-medium">Pending</span>
            </div>
          )}
        </div>

        {/* Assignment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Due Date</p>
            <p className="text-lg font-semibold">{formatDueDate(assignment.dueDate)}</p>
            {assignment.dueDate && (
              <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                {getTimeUntilDue(assignment.dueDate)}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Points</p>
            <p className="text-lg font-semibold">{assignment.totalPoints}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Type</p>
            <p className="text-lg font-semibold capitalize">{assignment.type}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
        </div>

        {assignment.instructions && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
          </div>
        )}

        {/* Assignment Attachments */}
        {assignment.attachments?.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Assignment Files</h3>
            <div className="space-y-2">
              {assignment.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <PaperClipIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{attachment.originalName}</span>
                  </div>
                  <a
                    href={`/api${attachment.path}`}
                    download
                    className="btn btn-secondary btn-sm"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Section */}
      {user?.role === 'student' && (
        <>
          {submission ? (
            /* Existing Submission */
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Submitted:</span>
                    <p>{formatDateTime(submission.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className={`font-medium ${
                      submission.status === 'graded' ? 'text-green-600' :
                      submission.status === 'submitted' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </p>
                  </div>
                  {submission.grade && (
                    <div>
                      <span className="font-medium text-gray-600">Grade:</span>
                      <p className="font-semibold text-lg">
                        {submission.grade.points}/{assignment.totalPoints} ({submission.grade.letterGrade})
                      </p>
                    </div>
                  )}
                </div>

                {submission.submissionText && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Text Submission</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{submission.submissionText}</p>
                    </div>
                  </div>
                )}

                {submission.attachments?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submitted Files</h4>
                    <div className="space-y-2">
                      {submission.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <PaperClipIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <span>{attachment.originalName}</span>
                          </div>
                          <a
                            href={`/api${attachment.path}`}
                            download
                            className="btn btn-secondary btn-sm"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.feedback && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instructor Feedback</h4>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : canSubmit ? (
            /* Submission Form */
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Assignment</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {assignment.submissionType !== 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Submission
                    </label>
                    <textarea
                      rows={6}
                      value={submissionForm.submissionText}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, submissionText: e.target.value }))}
                      className="input"
                      placeholder="Enter your submission text here..."
                      required={assignment.submissionType === 'text'}
                    />
                  </div>
                )}

                {assignment.submissionType !== 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Attachments
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept={assignment.allowedFileTypes?.map(type => `.${type}`).join(',')}
                        />
                        <label htmlFor="file-upload" className="btn btn-secondary cursor-pointer">
                          Choose Files
                        </label>
                        <p className="text-sm text-gray-600 mt-2">
                          Allowed types: {assignment.allowedFileTypes?.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Max size: {Math.round(assignment.maxFileSize / 1024 / 1024)}MB per file
                        </p>
                      </div>
                    </div>
                    
                    {submissionForm.attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <ul className="space-y-1">
                          {submissionForm.attachments.map((file, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {file.name} ({Math.round(file.size / 1024)}KB)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/assignments')}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submissionLoading}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {submissionLoading ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Cannot Submit */
            <div className="card">
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isOverdue ? 'Assignment Overdue' : 'Submission Closed'}
                </h3>
                <p className="text-gray-600">
                  {isOverdue 
                    ? 'This assignment is past the due date and late submissions are not allowed.'
                    : 'The submission period for this assignment has ended.'
                  }
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentDetail;

