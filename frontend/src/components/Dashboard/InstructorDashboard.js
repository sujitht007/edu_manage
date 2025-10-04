import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchCoursePerformance();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursePerformance = async () => {
    try {
      // First get instructor's courses
      const coursesResponse = await axios.get(`/api/courses/instructor/${user._id}`);
      const courses = coursesResponse.data;
      
      // Then fetch performance data for each course
      const performancePromises = courses.map(async (course) => {
        try {
          const perfResponse = await axios.get(`/api/courses/${course._id}/performance`);
          return { ...perfResponse.data, courseTitle: course.title };
        } catch (error) {
          console.error(`Error fetching performance for course ${course._id}:`, error);
          return {
            courseId: course._id,
            courseTitle: course.title,
            completionRate: 0,
            submissionRate: 0,
            averageGrade: 0,
            averageSatisfaction: 0
          };
        }
      });
      
      const performanceData = await Promise.all(performancePromises);
      setCoursePerformance(performanceData);
      
    } catch (error) {
      console.error('Error fetching course performance:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      name: 'My Courses',
      value: dashboardData?.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/courses'
    },
    {
      name: 'Total Students',
      value: dashboardData?.totalStudents || 0,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Assignments',
      value: dashboardData?.totalAssignments || 0,
      icon: DocumentTextIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      href: '/assignments'
    },
    {
      name: 'Pending Grading',
      value: dashboardData?.totalPendingGrading || 0, // This would come from actual data
      icon: ClipboardDocumentCheckIcon,
      color: 'text-red-600',
      bg: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Account Status Alert */}
      {!user?.isApproved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Account Pending Approval:</strong> Please upload your verification documents to complete your account setup.
                <Link to="/upload-documents" className="font-medium underline ml-2">
                  Upload Documents
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, Professor {user?.lastName}!</h1>
        <p className="mt-2 text-green-100">
          Manage your courses, track student progress, and create engaging content.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/create-course"
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <PlusIcon className="h-8 w-8 text-blue-600" />
          <span className="ml-3 font-medium text-gray-900">Create New Course</span>
        </Link>
        
        <Link
          to="/create-assignment"
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <PlusIcon className="h-8 w-8 text-green-600" />
          <span className="ml-3 font-medium text-gray-900">Create Assignment</span>
        </Link>
        
        <Link
          to="/attendance"
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-purple-600" />
          <span className="ml-3 font-medium text-gray-900">Mark Attendance</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`${stat.bg} rounded-lg p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h2>
          {dashboardData?.recentEnrollments?.map((enrollment) => (
            <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {enrollment.student?.firstName} {enrollment.student?.lastName}
                </p>
                <p className="text-sm text-gray-600">{enrollment.course?.title}</p>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(enrollment.enrollmentDate)}
              </p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Course Performance</h2>
            {coursePerformance.length > 0 && (
              <Link 
                to={`/courses/${coursePerformance[0].courseId}/performance`}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View Details
              </Link>
            )}
          </div>
          {coursePerformance.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No course performance data available</p>
              <p className="text-sm">Create courses and assignments to see performance metrics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Performance Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Overall Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Completion Rate</span>
                      <span className="font-semibold">
                        {coursePerformance.length > 0 
                          ? Math.round(coursePerformance.reduce((sum, course) => sum + course.completionRate, 0) / coursePerformance.length) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Submission Rate</span>
                      <span className="font-semibold">
                        {coursePerformance.length > 0 
                          ? Math.round(coursePerformance.reduce((sum, course) => sum + course.submissionRate, 0) / coursePerformance.length) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Grade</span>
                      <span className="font-semibold">
                        {coursePerformance.length > 0 
                          ? Math.round(coursePerformance.reduce((sum, course) => sum + course.averageGrade, 0) / coursePerformance.length) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Student Satisfaction</span>
                      <span className="font-semibold">
                        {coursePerformance.length > 0 
                          ? (coursePerformance.reduce((sum, course) => sum + course.averageSatisfaction, 0) / coursePerformance.length).toFixed(1) 
                          : 0}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Course Performance */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Course Breakdown</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {coursePerformance.slice(0, 5).map((course) => (
                    <div key={course.courseId} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {course.courseTitle}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {course.totalStudents} students
                          </span>
                          <Link
                            to={`/courses/${course.courseId}/performance`}
                            className="text-xs text-primary-600 hover:text-primary-500"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion:</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Grade:</span>
                          <span className="font-medium">{course.averageGrade}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
