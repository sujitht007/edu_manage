import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  ChartBarIcon,
  TrophyIcon,
  BookOpenIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';

const GradeView = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudentGrades = useCallback(async () => {
    try {
      const response = await axios.get(`/api/grades/student/${user._id}`);
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  const fetchInstructorCourses = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/instructor/${user._id}`);
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  const fetchCourseGrades = useCallback(async () => {
    try {
      const response = await axios.get(`/api/grades/course/${selectedCourse}`);
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching course grades:', error);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentGrades();
    } else {
      fetchInstructorCourses();
    }
  }, [fetchInstructorCourses, fetchStudentGrades, user?.role]);

  useEffect(() => {
    if (selectedCourse && user?.role !== 'student') {
      fetchCourseGrades();
    }
  }, [selectedCourse, user?.role, fetchCourseGrades]);

  const calculateGPA = (grades) => {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((sum, grade) => sum + ((grade.gpa || 0) * (grade.course?.credits || 0)), 0);
    const totalCredits = grades.reduce((sum, grade) => sum + (grade.course?.credits || 0), 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'student' 
            ? 'View your academic performance and grades'
            : 'Manage and track student grades for your courses'
          }
        </p>
      </div>

      {user?.role === 'student' ? (
        /* Student Grade View */
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overall GPA</p>
                  <p className="text-2xl font-semibold text-gray-900">{calculateGPA(grades)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{grades.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Grade</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {grades.length > 0 
                      ? (grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length).toFixed(1) + '%'
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Credits</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {grades.reduce((sum, grade) => sum + (grade.course?.credits || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grade List */}
          {grades.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grades available</h3>
              <p className="text-gray-600">Your grades will appear here once assignments are graded</p>
            </div>
          ) : (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Grades</h2>
              <div className="space-y-4">
                {grades.map((grade) => (
                  <div key={grade._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{grade.course?.title || 'Unknown Course'}</h3>
                      <p className="text-sm text-gray-600">{grade.course?.courseCode || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.percentage || 0)}`}>
                        {grade.letterGrade || 'N/A'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{(grade.percentage || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Instructor Grade Management */
        <div className="space-y-6">
          {/* Course Selection */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Course Grades</h2>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input max-w-xs"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grades Table for Instructors */}
          {selectedCourse && grades.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Grades</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade) => (
                      <tr key={grade._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {grade.student?.firstName} {grade.student?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{grade.student?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.percentage)}`}>
                            {grade.letterGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grade.percentage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            grade.isFinalized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {grade.isFinalized ? 'Finalized' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No grades message */}
          {selectedCourse && grades.length === 0 && (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grades available</h3>
              <p className="text-gray-600">Grades will appear here once assignments are graded</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradeView;
