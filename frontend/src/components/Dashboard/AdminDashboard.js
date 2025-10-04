import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
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

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      name: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Active Courses',
      value: dashboardData?.activeCourses || 0,
      icon: BookOpenIcon,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Total Enrollments',
      value: dashboardData?.totalEnrollments || 0,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Pending Approvals',
      value: dashboardData?.pendingApprovals || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-purple-100">
          Monitor system performance, manage users, and oversee all platform activities.
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-lg font-semibold text-green-600">Online</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Server Load</p>
              <p className="text-lg font-semibold text-blue-600">Normal</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Issues</p>
              <p className="text-lg font-semibold text-yellow-600">0 Open</p>
            </div>
          </div>
        </div>
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

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/create-course"
          className="card hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-center">
            <PlusIcon className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Create Course</h3>
            <p className="text-sm text-gray-600 mt-2">
              Add a new course to the platform
            </p>
          </div>
        </Link>
        <Link
          to="/admin/users"
          className="card hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600 mt-2">
              Manage student and instructor accounts
            </p>
          </div>
        </Link>

        <Link
          to="/courses"
          className="card hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-center">
            <BookOpenIcon className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Course Management</h3>
            <p className="text-sm text-gray-600 mt-2">
              Approve and manage all courses
            </p>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="card hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-2">
              View detailed system analytics
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent User Registrations</h2>
          {dashboardData?.recentEnrollments?.slice(0, 5).map((enrollment) => (
            <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {enrollment.student?.firstName} {enrollment.student?.lastName}
                </p>
                <p className="text-sm text-gray-600">Student</p>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(enrollment.enrollmentDate)}
              </p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h2>
          {dashboardData?.courseStats?.slice(0, 5).map((course) => (
            <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <div>
                <p className="font-medium text-gray-900">{course.title}</p>
                <p className="text-sm text-gray-600">
                  {course.currentEnrollment}/{course.maxStudents} enrolled
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {course.utilizationRate?.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">utilization</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
