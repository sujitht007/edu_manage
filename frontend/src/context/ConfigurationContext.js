import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ConfigurationContext = createContext();

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

export const ConfigurationProvider = ({ children }) => {
  const [configurations, setConfigurations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch public configurations
  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/configurations/public');
      setConfigurations(response.data);
    } catch (err) {
      console.error('Error fetching configurations:', err);
      setError(err.message);
      // Set default configurations if fetch fails
      setConfigurations({
        site_name: 'EduManage',
        site_description: 'Comprehensive Course Management System',
        maintenance_mode: false,
        max_file_size: 10485760,
        allowed_file_types: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'],
        max_course_capacity: 50,
        course_approval_required: true,
        instructor_verification_required: true,
        student_registration_open: true,
        instructor_registration_open: true,
        assignment_late_penalty: 10,
        assignment_auto_grade: false,
        attendance_required_percentage: 75,
        email_notifications_enabled: true,
        push_notifications_enabled: true,
        password_min_length: 8,
        theme_primary_color: '#3B82F6',
        theme_secondary_color: '#10B981',
        dashboard_widgets: ['recent_activity', 'course_stats', 'assignment_deadlines', 'attendance_summary']
      });
    } finally {
      setLoading(false);
    }
  };

  // Get configuration value by key
  const getConfig = (key, defaultValue = null) => {
    return configurations[key] !== undefined ? configurations[key] : defaultValue;
  };

  // Get multiple configurations
  const getConfigs = (keys) => {
    const result = {};
    keys.forEach(key => {
      result[key] = getConfig(key);
    });
    return result;
  };

  // Check if maintenance mode is enabled
  const isMaintenanceMode = () => {
    return getConfig('maintenance_mode', false);
  };

  // Check if registration is open for a role
  const isRegistrationOpen = (role) => {
    if (role === 'student') {
      return getConfig('student_registration_open', true);
    } else if (role === 'instructor') {
      return getConfig('instructor_registration_open', true);
    }
    return false;
  };

  // Get file upload configuration
  const getFileUploadConfig = () => {
    return {
      maxSize: getConfig('max_file_size', 10485760),
      allowedTypes: getConfig('allowed_file_types', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov']),
      maxSizeMB: Math.round(getConfig('max_file_size', 10485760) / 1024 / 1024)
    };
  };

  // Get theme configuration
  const getThemeConfig = () => {
    return {
      primaryColor: getConfig('theme_primary_color', '#3B82F6'),
      secondaryColor: getConfig('theme_secondary_color', '#10B981'),
      dashboardWidgets: getConfig('dashboard_widgets', ['recent_activity', 'course_stats', 'assignment_deadlines', 'attendance_summary'])
    };
  };

  // Get course configuration
  const getCourseConfig = () => {
    return {
      maxCapacity: getConfig('max_course_capacity', 50),
      approvalRequired: getConfig('course_approval_required', true)
    };
  };

  // Get assignment configuration
  const getAssignmentConfig = () => {
    return {
      latePenalty: getConfig('assignment_late_penalty', 10),
      autoGrade: getConfig('assignment_auto_grade', false)
    };
  };

  // Get attendance configuration
  const getAttendanceConfig = () => {
    return {
      requiredPercentage: getConfig('attendance_required_percentage', 75)
    };
  };

  // Get notification configuration
  const getNotificationConfig = () => {
    return {
      emailEnabled: getConfig('email_notifications_enabled', true),
      pushEnabled: getConfig('push_notifications_enabled', true)
    };
  };

  // Get security configuration
  const getSecurityConfig = () => {
    return {
      passwordMinLength: getConfig('password_min_length', 8)
    };
  };

  // Refresh configurations
  const refreshConfigurations = () => {
    fetchConfigurations();
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const value = {
    configurations,
    loading,
    error,
    getConfig,
    getConfigs,
    isMaintenanceMode,
    isRegistrationOpen,
    getFileUploadConfig,
    getThemeConfig,
    getCourseConfig,
    getAssignmentConfig,
    getAttendanceConfig,
    getNotificationConfig,
    getSecurityConfig,
    refreshConfigurations
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};