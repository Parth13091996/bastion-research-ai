import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutDashboard,
  MessageSquare,
  User,
  Users,
  Settings,
  Briefcase,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Comments', icon: MessageSquare, path: '/admin/comments' },
  { name: 'ARMember', icon: User, path: '/admin/armember' },
  { name: 'Job Openings', icon: Briefcase, path: '/admin/job-openings' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
  { name: 'Site Kit', icon: ExternalLink, path: '/admin/site-kit' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between p-4 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && <h1 className="text-2xl font-bold">Admin</h1>}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-full hover:bg-gray-700"
        >
          <ChevronLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <nav className="flex-1 mt-8 space-y-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
            }
            title={isCollapsed ? item.name : ''}
          >
            <item.icon className="h-6 w-6" />
            {!isCollapsed && <span className="ml-4">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform
                   lg:hidden transition-transform duration-300 ease-in-out
                   ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </div>
       {isMobileOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={toggleMobileMenu}></div>}


      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-800 text-white transition-all duration-300
                   ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
