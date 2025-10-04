import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ConfigurationProvider } from './context/ConfigurationContext';
import MaintenanceMode from './components/Common/MaintenanceMode';

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboard Components
import StudentDashboard from './components/Dashboard/StudentDashboard';
import InstructorDashboard from './components/Dashboard/InstructorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// Feature Components
import CourseList from './components/Courses/CourseList';
import CourseDetail from './components/Courses/CourseDetail';
import CourseMaterials from './components/Courses/CourseMaterials';
import CreateCourse from './components/Courses/CreateCourse';
import CoursePerformance from './components/Courses/CoursePerformance';
import MyEnrollments from './components/Enrollments/MyEnrollments';
import AssignmentList from './components/Assignments/AssignmentList';
import AssignmentDetail from './components/Assignments/AssignmentDetail';
import CreateAssignment from './components/Assignments/CreateAssignment';
import AssignmentSubmissions from './components/Assignments/AssignmentSubmissions';
import AttendanceView from './components/Attendance/AttendanceView';
import GradeView from './components/Grades/GradeView';
import Messages from './components/Messages/Messages';
import Profile from './components/Profile/Profile';
import UserManagement from './components/Admin/UserManagement';
import DocumentUpload from './components/Auth/DocumentUpload';
import InstructorVerification from './components/Admin/InstructorVerification';
import ConfigurationManagement from './components/Admin/ConfigurationManagement';
import HomePage from './components/Home/HomePage';

// Loading Component
import LoadingSpinner from './components/Common/LoadingSpinner';

// Maintenance Mode Wrapper
const MaintenanceModeWrapper = ({ children }) => {
  return (
    <>
      <MaintenanceMode />
      {children}
    </>
  );
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  const PublicRoute = ({ children }) => {
    // Prevent update loop: only redirect if not loading and user exists
    if (!loading && user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  const getDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <ConfigurationProvider>
      <MaintenanceModeWrapper>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <PublicRoute>
              <PublicLayout>
                <Login />
              </PublicLayout>
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <PublicLayout>
                <Register />
              </PublicLayout>
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                {getDashboard()}
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute>
              <Layout>
                <CourseList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/courses/:id" element={
            <ProtectedRoute>
              <Layout>
                <CourseDetail />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/courses/:id/materials" element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <Layout>
                <CourseMaterials />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/courses/:id/performance" element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <Layout>
                <CoursePerformance />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/create-course" element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <Layout>
                <CreateCourse />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/my-courses" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <MyEnrollments />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/assignments" element={
            <ProtectedRoute>
              <Layout>
                <AssignmentList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/assignments/:id" element={
            <ProtectedRoute>
              <Layout>
                <AssignmentDetail />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/assignments/:id/submissions" element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <Layout>
                <AssignmentSubmissions />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/create-assignment" element={
            <ProtectedRoute allowedRoles={['instructor']}> {/* Removed admin */}
              <Layout>
                <CreateAssignment />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute>
              <Layout>
                <AttendanceView />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/grades" element={
            <ProtectedRoute>
              <Layout>
                <GradeView />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/upload-documents" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <DocumentUpload />
            </ProtectedRoute>
          } />

          <Route path="/admin/instructor-verification" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <InstructorVerification />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/configuration" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <ConfigurationManagement />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="text-gray-600 mt-2">Page not found</p>
              </div>
            </div>
          } />
            </Routes>
          </div>
        </Router>
      </MaintenanceModeWrapper>
    </ConfigurationProvider>
  );
}

export default App;
