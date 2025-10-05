import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';

const MyEnrollments = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/enrollments/student/${user._id}`);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (finalGrade) => {
    if (!finalGrade?.percentage) return 'text-gray-600';
    const percentage = finalGrade.percentage;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-2 text-gray-600">
          Track your enrolled courses and academic progress
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{enrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {enrollments.filter(e => e.status === 'enrolled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {enrollments.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {enrollments.length > 0 
                  ? Math.round(enrollments.reduce((sum, e) => sum + (e.attendance?.attendancePercentage || 0), 0) / enrollments.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
          <p className="text-gray-600 mb-4">Start learning by enrolling in your first course</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment._id} className="card hover:shadow-md transition-shadow">
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                  {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {enrollment.course.credits} credits
                </span>
              </div>

              {/* Course Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {enrollment.course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{enrollment.course.courseCode}</p>
                
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="space-y-3 mb-4">
                {/* Attendance */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Attendance</span>
                    <span className="font-medium">
                      {enrollment.attendance.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${enrollment.attendance.attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Grade */}
                {enrollment.finalGrade?.percentage !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Current Grade</span>
                      <span className={`font-medium ${getGradeColor(enrollment.finalGrade)}`}>
                        {enrollment.finalGrade.letterGrade} ({enrollment.finalGrade.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          enrollment.finalGrade.percentage >= 90 ? 'bg-green-500' :
                          enrollment.finalGrade.percentage >= 80 ? 'bg-blue-500' :
                          enrollment.finalGrade.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${enrollment.finalGrade.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link
                  to={`/courses/${enrollment.course._id}`}
                  className="flex-1 btn btn-secondary text-center"
                >
                  View Course
                </Link>
                <Link
                  to={`/assignments?course=${enrollment.course._id}`}
                  className="flex-1 btn btn-primary text-center"
                >
                  Assignments
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
