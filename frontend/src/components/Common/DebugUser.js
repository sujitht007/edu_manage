import { useAuth } from '../../context/AuthContext';

const DebugUser = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>No user data found</div>;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50 max-w-sm">
      <h3 className="font-bold">Debug User Info:</h3>
      <div className="text-sm">
        <p><strong>ID:</strong> {user._id}</p>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
        <p><strong>Approved:</strong> {user.isApproved ? 'Yes' : 'No'}</p>
        <p><strong>Full User Object:</strong></p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugUser;
