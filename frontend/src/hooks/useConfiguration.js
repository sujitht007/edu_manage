import { useConfiguration } from '../context/ConfigurationContext';

// Custom hook for easier configuration access
export const useConfig = () => {
  const {
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
  } = useConfiguration();

  return {
    // Raw data
    configurations,
    loading,
    error,
    
    // Basic getters
    getConfig,
    getConfigs,
    
    // Specific configuration getters
    isMaintenanceMode,
    isRegistrationOpen,
    getFileUploadConfig,
    getThemeConfig,
    getCourseConfig,
    getAssignmentConfig,
    getAttendanceConfig,
    getNotificationConfig,
    getSecurityConfig,
    
    // Actions
    refreshConfigurations,
    
    // Convenience getters for common configurations
    siteName: getConfig('site_name', 'EduManage'),
    siteDescription: getConfig('site_description', 'Comprehensive Course Management System'),
    maintenanceMode: isMaintenanceMode(),
    maxFileSize: getConfig('max_file_size', 10485760),
    maxFileSizeMB: Math.round(getConfig('max_file_size', 10485760) / 1024 / 1024),
    allowedFileTypes: getConfig('allowed_file_types', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov']),
    maxCourseCapacity: getConfig('max_course_capacity', 50),
    courseApprovalRequired: getConfig('course_approval_required', true),
    instructorVerificationRequired: getConfig('instructor_verification_required', true),
    studentRegistrationOpen: isRegistrationOpen('student'),
    instructorRegistrationOpen: isRegistrationOpen('instructor'),
    assignmentLatePenalty: getConfig('assignment_late_penalty', 10),
    assignmentAutoGrade: getConfig('assignment_auto_grade', false),
    attendanceRequiredPercentage: getConfig('attendance_required_percentage', 75),
    emailNotificationsEnabled: getConfig('email_notifications_enabled', true),
    pushNotificationsEnabled: getConfig('push_notifications_enabled', true),
    passwordMinLength: getConfig('password_min_length', 8),
    themePrimaryColor: getConfig('theme_primary_color', '#3B82F6'),
    themeSecondaryColor: getConfig('theme_secondary_color', '#10B981'),
    dashboardWidgets: getConfig('dashboard_widgets', ['recent_activity', 'course_stats', 'assignment_deadlines', 'attendance_summary'])
  };
};

export default useConfig;