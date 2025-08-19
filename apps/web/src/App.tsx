import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobOpenings from './pages/AdminJobOpenings';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminComments from './pages/AdminComments';
import AdminARMember from './pages/AdminARMember';
import AdminSiteKit from './pages/AdminSiteKit';
import PublicPage from './pages/PublicPage';
import ManageMembers from './pages/Admin/AR/ManageMembers';
import ManagePlans from './pages/Admin/AR/ManagePlans';
import ManageSubscriptions from './pages/Admin/AR/ManageSubscriptions';
import PaymentHistory from './pages/Admin/AR/PaymentHistory';
import JobOpenings from './pages/Admin/Jobs/JobOpenings';
import Applications from './pages/Admin/Jobs/Applications';
import AllUsers from './pages/Admin/Users/AllUsers';
import AddUser from './pages/Admin/Users/AddUser';
import Profile from './pages/Admin/Users/Profile';
import AddNewJob from './pages/Admin/Jobs/AddNewJob';
import CouponManagement from './pages/Admin/AR/CouponManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<RootLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/:pageName" element={<PublicPage />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="ar/members" element={<ManageMembers />} />
                <Route path="ar/plans" element={<ManagePlans />} />
                <Route path="ar/subscriptions" element={<ManageSubscriptions />} />
                <Route path="ar/payments" element={<PaymentHistory />} />
                <Route path="ar/coupons" element={<CouponManagement />} />
                <Route path="jobs/openings" element={<JobOpenings />} />
                <Route path="jobs/add" element={<AddNewJob />} />
                <Route path="jobs/applications" element={<Applications />} />
                <Route path="users/all" element={<AllUsers />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="users/profile" element={<Profile />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
    </QueryClientProvider>
  );
}

export default App;
