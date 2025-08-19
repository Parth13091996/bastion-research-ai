import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="font-bold">Username:</label>
          <p>{user.username}</p>
        </div>
        <div className="mb-4">
          <label className="font-bold">Email:</label>
          <p>{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="font-bold">Name:</label>
          <p>{`${user.first_name} ${user.last_name}`}</p>
        </div>
        <div className="mb-4">
          <label className="font-bold">Role:</label>
          <p>{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
