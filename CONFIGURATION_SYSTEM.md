# Dynamic Configuration System

This document describes the dynamic configuration system implemented in the EduManage platform, allowing administrators to manage system settings without code changes.

## Overview

The configuration system provides:
- **Dynamic Settings**: Change system behavior without code deployment
- **Role-based Access**: Admin-only configuration management
- **Type Safety**: Validated configuration values with type checking
- **Real-time Updates**: Changes take effect immediately
- **Public/Private Configs**: Some settings are public, others admin-only
- **Validation Rules**: Built-in validation for different data types
- **Bulk Operations**: Update multiple configurations at once
- **Export/Import**: Backup and restore configurations

## Architecture

### Backend Components

1. **Configuration Model** (`backend/models/Configuration.js`)
   - MongoDB schema for storing configurations
   - Type validation and value formatting
   - Built-in validation methods
   - Version tracking and audit trail

2. **Configuration Routes** (`backend/routes/configurations.js`)
   - RESTful API endpoints for CRUD operations
   - Admin-only access control
   - Bulk update and export functionality
   - Public configuration endpoint

3. **Seed Script** (`backend/scripts/seedConfigurations.js`)
   - Pre-populates system with default configurations
   - Run with: `npm run seed-config`

### Frontend Components

1. **Configuration Management** (`frontend/src/components/Admin/ConfigurationManagement.js`)
   - Admin interface for managing configurations
   - Search, filter, and pagination
   - Inline editing with type-specific inputs
   - Bulk operations and export functionality

2. **Configuration Context** (`frontend/src/context/ConfigurationContext.js`)
   - Global state management for configurations
   - Automatic fetching of public configurations
   - Error handling and fallback values

3. **Configuration Hook** (`frontend/src/hooks/useConfiguration.js`)
   - Easy-to-use hook for accessing configurations
   - Type-safe getters for common settings
   - Convenience methods for specific configuration groups

4. **Maintenance Mode** (`frontend/src/components/Common/MaintenanceMode.js`)
   - System-wide maintenance mode display
   - Controlled by `maintenance_mode` configuration

## Configuration Categories

### System Settings
- `site_name`: Application name
- `site_description`: Application description
- `maintenance_mode`: Enable/disable maintenance mode

### File Upload Settings
- `max_file_size`: Maximum file upload size in bytes
- `allowed_file_types`: Array of allowed file extensions

### Course Management
- `max_course_capacity`: Maximum students per course
- `course_approval_required`: Require admin approval for courses

### User Management
- `instructor_verification_required`: Require document verification
- `student_registration_open`: Allow student registrations
- `instructor_registration_open`: Allow instructor registrations

### Assignment Settings
- `assignment_late_penalty`: Late submission penalty percentage
- `assignment_auto_grade`: Enable automatic grading

### Attendance Settings
- `attendance_required_percentage`: Minimum attendance required

### Notification Settings
- `email_notifications_enabled`: Enable email notifications
- `push_notifications_enabled`: Enable push notifications

### Security Settings
- `session_timeout`: Session timeout in seconds
- `password_min_length`: Minimum password length
- `max_login_attempts`: Maximum login attempts before lockout

### UI Settings
- `theme_primary_color`: Primary theme color (hex)
- `theme_secondary_color`: Secondary theme color (hex)
- `dashboard_widgets`: Available dashboard widgets

### Analytics Settings
- `analytics_tracking_enabled`: Enable analytics tracking
- `data_retention_days`: Data retention period

## Usage Examples

### Using Configuration Hook

```javascript
import { useConfig } from '../hooks/useConfiguration';

function MyComponent() {
  const { 
    siteName, 
    maxFileSizeMB, 
    isMaintenanceMode,
    getConfig 
  } = useConfig();

  return (
    <div>
      <h1>Welcome to {siteName}</h1>
      {isMaintenanceMode() && <MaintenanceBanner />}
      <FileUpload maxSize={maxFileSizeMB * 1024 * 1024} />
    </div>
  );
}
```

### Accessing Specific Configuration Groups

```javascript
import { useConfig } from '../hooks/useConfiguration';

function CourseSettings() {
  const { getCourseConfig, getFileUploadConfig } = useConfig();
  
  const courseConfig = getCourseConfig();
  const uploadConfig = getFileUploadConfig();
  
  return (
    <div>
      <p>Max capacity: {courseConfig.maxCapacity}</p>
      <p>Max file size: {uploadConfig.maxSizeMB}MB</p>
    </div>
  );
}
```

### Direct Configuration Access

```javascript
import { useConfig } from '../hooks/useConfiguration';

function CustomComponent() {
  const { getConfig, getConfigs } = useConfig();
  
  // Get single configuration
  const themeColor = getConfig('theme_primary_color', '#3B82F6');
  
  // Get multiple configurations
  const settings = getConfigs(['site_name', 'maintenance_mode']);
  
  return <div style={{ color: themeColor }}>{settings.site_name}</div>;
}
```

## API Endpoints

### Admin Endpoints (Admin Only)

- `GET /api/configurations` - List all configurations
- `GET /api/configurations/categories` - Get configuration categories
- `GET /api/configurations/:key` - Get specific configuration
- `POST /api/configurations` - Create new configuration
- `PUT /api/configurations/:key` - Update configuration
- `DELETE /api/configurations/:key` - Delete configuration
- `POST /api/configurations/bulk-update` - Bulk update configurations
- `POST /api/configurations/reset/:key` - Reset to default value
- `GET /api/configurations/export` - Export configurations

### Public Endpoints

- `GET /api/configurations/public` - Get public configurations only

## Configuration Types

### String
- Text values with optional length validation
- Pattern matching support
- Example: `site_name`, `theme_primary_color`

### Number
- Numeric values with min/max validation
- Example: `max_file_size`, `max_course_capacity`

### Boolean
- True/false values
- Example: `maintenance_mode`, `email_notifications_enabled`

### Array
- List of values with option validation
- Example: `allowed_file_types`, `dashboard_widgets`

### Object/JSON
- Complex data structures
- Example: Custom configuration objects

## Validation Rules

Each configuration can have validation rules:

```javascript
{
  validation: {
    min: 1,           // Minimum value (for numbers/strings)
    max: 100,         // Maximum value (for numbers/strings)
    pattern: '^#.*',  // Regex pattern (for strings)
    options: [...],   // Allowed values (for arrays)
    required: true    // Required field
  }
}
```

## Security Considerations

1. **Access Control**: Only admins can modify configurations
2. **Validation**: All values are validated before saving
3. **Type Safety**: Type checking prevents invalid data
4. **Audit Trail**: All changes are tracked with user and timestamp
5. **Sensitive Data**: Private configurations are not exposed to frontend

## Maintenance Mode

The system includes a built-in maintenance mode:

1. Set `maintenance_mode` to `true` in admin panel
2. All users see maintenance page instead of normal interface
3. Admins can still access the system
4. Automatic refresh option for users

## Best Practices

1. **Use Default Values**: Always provide fallback values
2. **Validate Input**: Use built-in validation rules
3. **Document Changes**: Add meaningful descriptions
4. **Test Changes**: Verify configurations work as expected
5. **Backup Regularly**: Export configurations before major changes
6. **Monitor Impact**: Watch for errors after configuration changes

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**
   - Check if configuration is public
   - Verify API endpoint accessibility
   - Check browser console for errors

2. **Validation Errors**
   - Ensure value matches expected type
   - Check validation rules (min, max, pattern)
   - Verify required fields are provided

3. **Changes Not Taking Effect**
   - Refresh the page
   - Check if configuration is cached
   - Verify the correct configuration key

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed configuration loading information.

## Migration Guide

### Adding New Configurations

1. Add to `seedConfigurations.js` with default values
2. Run `npm run seed-config` to populate database
3. Update frontend components to use new configuration
4. Test thoroughly before deploying

### Updating Existing Configurations

1. Use admin panel to modify values
2. Test changes in development environment
3. Export configurations as backup
4. Deploy changes to production

## Future Enhancements

- Configuration templates for different environments
- Configuration versioning and rollback
- Real-time configuration updates via WebSocket
- Configuration dependency management
- Advanced validation rules and custom validators
- Configuration analytics and usage tracking