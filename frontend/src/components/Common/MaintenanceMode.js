import { useConfig } from '../../hooks/useConfiguration';
import { CogIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MaintenanceMode = () => {
  const { isMaintenanceMode, siteName, siteDescription } = useConfig();

  if (!isMaintenanceMode()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CogIcon className="h-12 w-12 text-yellow-500 animate-spin" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {siteName} - Maintenance Mode
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {siteDescription}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              System Under Maintenance
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              We're currently performing scheduled maintenance to improve your experience. 
              Please check back later.
            </p>
            <div className="mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CogIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Maintenance in Progress
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Our team is working hard to bring you an improved experience. 
                        We apologize for any inconvenience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          If you continue to see this message, please contact support.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceMode;
