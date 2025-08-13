import { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Admin Panel</div>
        <nav className="mt-8">
          <Link to="/admin/dashboard" className="block px-4 py-2 text-lg hover:bg-gray-700">Dashboard</Link>
          <Link to="/admin/job-openings" className="block px-4 py-2 text-lg hover:bg-gray-700">Job Openings</Link>
          <Link to="/admin/users" className="block px-4 py-2 text-lg hover:bg-gray-700">Users</Link>
          <Link to="/admin/settings" className="block px-4 py-2 text-lg hover:bg-gray-700">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
