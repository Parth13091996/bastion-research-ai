import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// Layouts
const RootLayout = lazy(() => import("../layouts/RootLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// Guards
const ProtectedRoute = lazy(() => import("../components/ProtectedRoute"));
const AdminRoute = lazy(() => import("../components/AdminRoute"));

// Pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const CompleteProfile = lazy(() => import("../pages/CompleteProfile"));
const AuthCallback = lazy(() => import("../pages/AuthCallback"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Contact = lazy(() => import("../pages/Contact"));
const CareerPage = lazy(() => import("../pages/CareerPage"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermAndCondition = lazy(() => import("../pages/TermAndCondition"));
const Compliance = lazy(() => import("../pages/Compliance"));
const BastionCore = lazy(() => import("../pages/BastionCore"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const Subscription = lazy(() => import("../pages/Subscription"));
const SpotLights = lazy(() => import("../pages/SpotLights"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Admin Pages
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const ManageMembers = lazy(() => import("../pages/Admin/AR/ManageMembers"));
const ManagePlans = lazy(() => import("../pages/Admin/AR/ManagePlans"));
const ManageSubscriptions = lazy(() => import("../pages/Admin/AR/ManageSubscriptions"));
const PaymentHistory = lazy(() => import("../pages/Admin/AR/PaymentHistory"));
const CouponManagement = lazy(() => import("../pages/Admin/AR/CouponManagement"));
const JobOpenings = lazy(() => import("../pages/Admin/Jobs/JobOpenings"));
const AddNewJob = lazy(() => import("../pages/Admin/Jobs/AddNewJob"));
const Applications = lazy(() => import("../pages/Admin/Jobs/Applications"));
const AllUsers = lazy(() => import("../pages/Admin/Users/AllUsers"));
const AddUser = lazy(() => import("../pages/Admin/Users/AddUser"));
const Profile = lazy(() => import("../pages/Admin/Users/Profile"));
const AdminSettings = lazy(() => import("../pages/AdminSettings"));

// Components that are used as pages
const PodcastsGrid = lazy(() => import("../components/generic/PodcastsGrid"));
const SmartFrameworks = lazy(() => import("../components/generic/SmartFrameworks"));

// Define App Routes
export const AppRoutes = {
    home: () => "/",
    login: () => "/login",
    register: () => "/register",
    completeProfile: () => "/complete-profile",
    authCallback: () => "/auth/callback",
    dashboard: () => "/dashboard",
    contact: () => "/contact",
    careerPage: () => "/career-page",
    refundPolicy: () => "/refund-policy",
    privacyPolicy: () => "/privacy-policy",
    termAndCondition: () => "/terms-and-conditions",
    compliance: () => "/compliance",
    bastionCore: () => "/bastion-core",
    editProfile: () => "/edit-profile",
    subscription: () => "/subscription",
    spotlights: () => "/spotlights",
    podcasts: () => "/podcasts",
    smartFrameworks: () => "/smart-frameworks",
    adminLogin: () => "/admin/login",
    adminDashboard: () => "/admin/dashboard",
    adminManageMembers: () => "/admin/ar/members",
    adminManagePlans: () => "/admin/ar/plans",
    adminManageSubscriptions: () => "/admin/ar/subscriptions",
    adminPaymentHistory: () => "/admin/ar/payments",
    adminCouponManagement: () => "/admin/ar/coupons",
    adminJobOpenings: () => "/admin/jobs/openings",
    adminAddNewJob: () => "/admin/jobs/add",
    adminApplications: () => "/admin/jobs/applications",
    adminAllUsers: () => "/admin/users/all",
    adminAddUser: () => "/admin/users/add",
    adminProfile: () => "/admin/users/profile",
    adminSettings: () => "/admin/settings",
};

export const routes: RouteObject[] = [
    {
        element: <RootLayout />,
        children: [
            { path: AppRoutes.home(), element: <Home /> },
            { path: AppRoutes.login(), element: <Login /> },
            { path: AppRoutes.register(), element: <Register /> },
            { path: AppRoutes.completeProfile(), element: <CompleteProfile /> },
            { path: AppRoutes.authCallback(), element: <AuthCallback /> },
            { path: AppRoutes.contact(), element: <Contact /> },
            { path: AppRoutes.careerPage(), element: <CareerPage /> },
            { path: AppRoutes.refundPolicy(), element: <RefundPolicy /> },
            { path: AppRoutes.privacyPolicy(), element: <PrivacyPolicy /> },
            { path: AppRoutes.termAndCondition(), element: <TermAndCondition /> },
            { path: AppRoutes.compliance(), element: <Compliance /> },
            { path: AppRoutes.bastionCore(), element: <BastionCore /> },
            { path: AppRoutes.spotlights(), element: <SpotLights /> },
            { path: AppRoutes.podcasts(), element: <PodcastsGrid /> },
            { path: AppRoutes.smartFrameworks(), element: <SmartFrameworks /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: AppRoutes.dashboard(), element: <Dashboard /> },
                    { path: AppRoutes.editProfile(), element: <EditProfile /> },
                    { path: AppRoutes.subscription(), element: <Subscription /> },
                ],
            },
        ],
    },
    {
        path: "/admin/login",
        element: <AdminLogin />,
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                element: <AdminRoute />,
                children: [
                    { path: "dashboard", element: <AdminDashboard /> },
                    { path: "ar/members", element: <ManageMembers /> },
                    { path: "ar/plans", element: <ManagePlans /> },
                    { path: "ar/subscriptions", element: <ManageSubscriptions /> },
                    { path: "ar/payments", element: <PaymentHistory /> },
                    { path: "ar/coupons", element: <CouponManagement /> },
                    { path: "jobs/openings", element: <JobOpenings /> },
                    { path: "jobs/add", element: <AddNewJob /> },
                    { path: "jobs/applications", element: <Applications /> },
                    { path: "users/all", element: <AllUsers /> },
                    { path: "users/add", element: <AddUser /> },
                    { path: "users/profile", element: <Profile /> },
                    { path: "settings", element: <AdminSettings /> },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];
