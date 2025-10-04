import { useConfiguration } from '../../hooks/useConfiguration';

const ConfigurationExample = () => {
  const { 
    getConfig, 
    getThemeConfig, 
    getSystemConfig, 
    isFeatureEnabled 
  } = useConfiguration();

  const themeConfig = getThemeConfig();
  const systemConfig = getSystemConfig();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Configuration Example</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700">Theme Configuration:</h4>
          <p className="text-sm text-gray-600">
            Site Name: {themeConfig.siteName}
          </p>
          <p className="text-sm text-gray-600">
            Primary Color: 
            <span 
              className="inline-block w-4 h-4 ml-2 rounded"
              style={{ backgroundColor: themeConfig.primaryColor }}
            ></span>
            {themeConfig.primaryColor}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">System Configuration:</h4>
          <p className="text-sm text-gray-600">
            User Registration: {systemConfig.userRegistrationEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-sm text-gray-600">
            Max File Size: {(systemConfig.maxFileSize / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Feature Flags:</h4>
          <p className="text-sm text-gray-600">
            Chat Enabled: {isFeatureEnabled('enable_chat') ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-600">
            Forum Enabled: {isFeatureEnabled('enable_forum') ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-600">
            Certificates Enabled: {isFeatureEnabled('enable_certificates') ? 'Yes' : 'No'}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Custom Configuration:</h4>
          <p className="text-sm text-gray-600">
            Welcome Email: {getConfig('welcome_email_enabled', false) ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-sm text-gray-600">
            Course Approval Required: {getConfig('course_approval_required', true) ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationExample;


