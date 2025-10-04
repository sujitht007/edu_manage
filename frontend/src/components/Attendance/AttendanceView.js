import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDateISO } from '../../utils/dateUtils';

const AttendanceView = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    students: [],
    classType: 'lecture',
    topic: '',
    duration: 60
  });

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentAttendance();
    } else {
      fetchInstructorCourses();
    }
  }, []);

  useEffect(() => {
    if (selectedCourse && user?.role !== 'student') {
      fetchCourseAttendance();
      fetchEnrolledStudents();
    }
  }, [selectedCourse]);

  const fetchStudentAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance/student/${user._id}`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
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
  };

  const fetchCourseAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance/course/${selectedCourse}`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching course attendance:', error);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await axios.get(`/api/enrollments/course/${selectedCourse}`);
      const students = response.data.map(enrollment => ({
        student: enrollment.student._id,
        name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        status: 'present'
      }));
      setAttendanceForm(prev => ({ ...prev, students }));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStudentStatusChange = (studentId, status) => {
    setAttendanceForm(prev => ({
      ...prev,
      students: prev.students.map(student =>
        student.student === studentId ? { ...student, status } : student
      )
    }));
  };

  const markAttendance = async () => {
    if (!selectedCourse || !selectedDate) {
      toast.error('Please select course and date');
      return;
    }

    setMarkingAttendance(true);
    try {
      await axios.post('/api/attendance', {
        courseId: selectedCourse,
        date: selectedDate,
        students: attendanceForm.students.map(s => ({
          student: s.student,
          status: s.status
        })),
        classType: attendanceForm.classType,
        topic: attendanceForm.topic,
        duration: attendanceForm.duration
      });

      toast.success('Attendance marked successfully!');
      fetchCourseAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'late':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <ExclamationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      case 'late':
        return 'text-yellow-600 bg-yellow-100';
      case 'excused':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'student' 
            ? 'View your attendance records across all courses'
            : 'Mark and track student attendance for your courses'
          }
        </p>
      </div>

      {user?.role === 'student' ? (
        /* Student Attendance View */
        <div className="space-y-6">
          {attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
              <p className="text-gray-600">Your attendance will appear here once classes begin</p>
            </div>
          ) : (
            attendanceData.map((courseData) => (
              <div key={courseData.course._id} className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {courseData.course.title}
                    </h2>
                    <p className="text-gray-600">{courseData.course.courseCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {courseData.attendance.attendancePercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {courseData.attendance.attendedClasses}/{courseData.attendance.totalClasses} classes
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        courseData.attendance.attendancePercentage >= 75 ? 'bg-green-500' :
                        courseData.attendance.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${courseData.attendance.attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recent Records */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Records</h3>
                  <div className="space-y-2">
                    {courseData.records.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">{record.classType}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Instructor Attendance Management */
        <div className="space-y-6">
          {/* Course Selection and Mark Attendance */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Type</label>
                <select
                  value={attendanceForm.classType}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, classType: e.target.value }))}
                  className="input"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                <input
                  type="number"
                  value={attendanceForm.duration}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="input"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                type="text"
                value={attendanceForm.topic}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, topic: e.target.value }))}
                className="input"
                placeholder="Today's topic or lesson"
              />
            </div>

            {/* Student List */}
            {attendanceForm.students.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Students</h3>
                <div className="space-y-2 mb-6">
                  {attendanceForm.students.map((student) => (
                    <div key={student.student} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{student.name}</span>
                      <div className="flex space-x-2">
                        {['present', 'absent', 'late', 'excused'].map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="radio"
                              name={`student-${student.student}`}
                              value={status}
                              checked={student.status === status}
                              onChange={(e) => handleStudentStatusChange(student.student, e.target.value)}
                              className="mr-1"
                            />
                            <span className="text-sm capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={markAttendance}
                  disabled={markingAttendance || !selectedCourse || !selectedDate}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {markingAttendance ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            )}
          </div>

          {/* Attendance History */}
          {selectedCourse && attendanceData.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h2>
              
              <div className="space-y-4">
                {attendanceData.map((record) => {
                  const stats = record.getAttendanceStats ? record.getAttendanceStats() : {
                    total: record.students?.length || 0,
                    present: record.students?.filter(s => s.status === 'present').length || 0,
                    absent: record.students?.filter(s => s.status === 'absent').length || 0,
                    late: record.students?.filter(s => s.status === 'late').length || 0,
                    excused: record.students?.filter(s => s.status === 'excused').length || 0
                  };

                  return (
                    <div key={record._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {record.topic || 'No topic specified'} • {record.classType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {((stats.present / stats.total) * 100).toFixed(1)}% present
                          </p>
                          <p className="text-sm text-gray-600">
                            {stats.present}/{stats.total} students
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-green-600">{stats.present}</p>
                          <p className="text-gray-600">Present</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-red-600">{stats.absent}</p>
                          <p className="text-gray-600">Absent</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-yellow-600">{stats.late}</p>
                          <p className="text-gray-600">Late</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-blue-600">{stats.excused}</p>
                          <p className="text-gray-600">Excused</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
