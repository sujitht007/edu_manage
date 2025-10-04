import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  DocumentTextIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatDateTime, getTimeUntilDate, isValidDate } from '../../utils/dateUtils';

const AssignmentList = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchAssignments();
    if (user?.role === 'student') {
      fetchEnrolledCourses();
    } else {
      fetchInstructorCourses();
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [selectedCourse, selectedStatus]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      let url = '/api/assignments';
      
      if (selectedCourse) {
        url = `/api/assignments/course/${selectedCourse}`;
      }

      const response = await axios.get(url);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(`/api/enrollments/student/${user._id}`);
      setCourses(response.data.map(enrollment => enrollment.course));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const response = await axios.get(`/api/courses/instructor/${user._id}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    if (!isValidDate(dueDate)) return 'Invalid date';
    
    return formatDateTime(dueDate);
  };

  const getDaysUntilDue = (dueDate) => {
    return getTimeUntilDate(dueDate);
  };

  const getStatusIcon = (assignment) => {
    if (!assignment.dueDate) return <ClockIcon className="h-5 w-5 text-gray-500" />;
    
    const dueDate = new Date(assignment.dueDate);
    if (isNaN(dueDate.getTime())) return <ClockIcon className="h-5 w-5 text-gray-500" />;
    
    const now = new Date();
    
    if (assignment.isSubmitted) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (dueDate < now) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (assignment.isSubmitted) {
      return 'Submitted';
    } else if (dueDate < now) {
      return 'Overdue';
    } else {
      return 'Pending';
    }
  };

  const getStatusColor = (assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (assignment.isSubmitted) {
      return 'text-green-600';
    } else if (dueDate < now) {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'student' 
              ? 'View and submit your assignments'
              : 'Manage course assignments and submissions'
            }
          </p>
        </div>
        
        {user?.role === 'instructor' && ( // Removed admin from create assignment button
          <Link
            to="/create-assignment"
            className="mt-4 sm:mt-0 btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Assignment
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.courseCode})
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCourse('');
                setSelectedStatus('');
              }}
              className="btn btn-secondary flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {user?.role === 'student' 
              ? 'No assignments available for your enrolled courses'
              : 'Create your first assignment to get started'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(assignment)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <span className={`text-sm font-medium ${getStatusColor(assignment)}`}>
                      {getStatusText(assignment)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Course:</span> {assignment.course?.title}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {assignment.type}
                    </div>
                    <div>
                      <span className="font-medium">Points:</span> {assignment.totalPoints}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span> {formatDueDate(assignment.dueDate)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={getStatusColor(assignment)}>
                        {getDaysUntilDue(assignment.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <Link
                    to={`/assignments/${assignment._id}`}
                    className="btn btn-primary text-center"
                  >
                    View Details
                  </Link>
                  
                  {user?.role === 'instructor' && assignment.instructor === user._id && (
                    <Link
                      to={`/assignments/${assignment._id}/submissions`}
                      className="btn btn-secondary"
                    >
                      View Submissions
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
