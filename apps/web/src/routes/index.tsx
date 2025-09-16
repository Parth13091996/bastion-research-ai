import Editor from "@/components/core/editor";
import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { AppRoutes } from "./app-routes";

// Layouts
const ClientLayout = lazy(() => import("../layouts/ClientLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const UserAdminLayout = lazy(() => import("../layouts/UserAdminLayout"));

// Guards
const ProtectedRoute = lazy(() => import("./ClientRoutes/ProtectedRoute"));
const AdminRoute = lazy(() => import("./AdminRoutes/AdminRoute"));
const UserAdminRoute = lazy(() => import("../components/UserAdminRoute"));

// Pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Contact = lazy(() => import("../pages/Contact"));
const CareerPage = lazy(() => import("../pages/Careers"));
const SingleCareerPage = lazy(() => import("../pages/Careers/SingleCareer"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermAndCondition = lazy(() => import("../pages/TermAndCondition"));
const Compliance = lazy(() => import("../pages/Compliance"));
const BastionCore = lazy(() => import("../pages/BastionCore"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const Subscription = lazy(() => import("../pages/Subscription"));
const TransactionHistory = lazy(() => import("../pages/TransactionHistory"));
const SpotLights = lazy(() => import("../pages/SpotLights"));
const About = lazy(() => import("../pages/About"));
const NotFound = lazy(() => import("../pages/NotFound"));

// User Admin Pages
const UserAdminDashboard = lazy(
  () => import("@/pages/UserAdmin/app/UserDashboard")
);
const UserAdminRecommendation = lazy(
  () => import("@/pages/UserAdmin/app/Recommendation")
);
const UserAdminResearchHub = lazy(
  () => import("@/pages/UserAdmin/app/ResearchHub")
);

// Admin Pages
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const ManageMembers = lazy(() => import("../pages/Admin/AR/ManageMembers"));
const ManagePlans = lazy(() => import("../pages/Admin/AR/ManagePlans"));
const ManageSubscriptions = lazy(
  () => import("../pages/Admin/AR/ManageSubscriptions")
);
const PaymentHistory = lazy(() => import("../pages/Admin/AR/PaymentHistory"));
const CouponManagement = lazy(
  () => import("../pages/Admin/AR/CouponManagement")
);
const JobOpenings = lazy(() => import("../pages/Admin/Jobs/JobOpenings"));
const AddNewJob = lazy(() => import("../pages/Admin/Jobs/AddNewJob"));
const Applications = lazy(() => import("../pages/Admin/Jobs/Applications"));
const AllUsers = lazy(() => import("../pages/Admin/Users/AllUsers"));
const AddUser = lazy(() => import("../pages/Admin/Users/AddUser"));
const Profile = lazy(() => import("../pages/Admin/Users/Profile"));
const AdminSettings = lazy(() => import("../pages/AdminSettings"));

// Components that are used as pages
const PodcastsBlog = lazy(() => import("../components/generic/PodcastsBlog"));
const Test = lazy(() => import("../components/generic/Test"));
const NewsletterArchive = lazy(
  () => import("../components/generic/NewsletterArchive")
);
const Webinar = lazy(() => import("../components/generic/Webinar"));
const SmartFrameworks = lazy(
  () => import("../components/generic/SmartFrameworks")
);

export const routes: RouteObject[] = [
  {
    element: <ClientLayout />,
    children: [
      { path: AppRoutes.home(), element: <Home /> },
      { path: AppRoutes.login(), element: <Login /> },
      { path: AppRoutes.register(), element: <Register /> },
      { path: AppRoutes.forgotPassword(), element: <ForgotPassword /> },
      { path: AppRoutes.resetPassword(), element: <ResetPassword /> },
      { path: AppRoutes.contact(), element: <Contact /> },
      { path: AppRoutes.careerPage(), element: <CareerPage /> },
      { path: AppRoutes.singleCareerPage(), element: <SingleCareerPage /> },
      { path: AppRoutes.refundPolicy(), element: <RefundPolicy /> },
      { path: AppRoutes.privacyPolicy(), element: <PrivacyPolicy /> },
      { path: AppRoutes.termAndCondition(), element: <TermAndCondition /> },
      { path: AppRoutes.compliance(), element: <Compliance /> },
      { path: AppRoutes.bastionCore(), element: <BastionCore /> },
      { path: AppRoutes.about(), element: <About /> },
      { path: AppRoutes.spotlights(), element: <SpotLights /> },
      { path: AppRoutes.podcasts(), element: <PodcastsBlog /> },
      { path: AppRoutes.test(), element: <Test /> },
      { path: AppRoutes.newsletter(), element: <NewsletterArchive /> },
      { path: AppRoutes.webinar(), element: <Webinar /> },
      { path: AppRoutes.smartFrameworks(), element: <SmartFrameworks /> },
      { path: AppRoutes.paymentSuccess(), element: <PaymentSuccess /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: AppRoutes.dashboard(), element: <Dashboard /> },
          { path: AppRoutes.editProfile(), element: <EditProfile /> },
          { path: AppRoutes.subscription(), element: <Subscription /> },
          { path: AppRoutes.transactionHistory(), element: <TransactionHistory /> },
        ],
      },
    ],
  },
  {
    element: <AdminLogin />,
    path: AppRoutes.adminLogin(),
  },
  {
    element: <AdminLayout />,
    path: AppRoutes.admin(),
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <Navigate to={AppRoutes.adminDashboard()} replace />,
          },
          {
            path: AppRoutes.adminDashboard(),
            element: <AdminDashboard />,
          },
          {
            path: AppRoutes.adminManageMembers(),
            element: <ManageMembers />,
          },
          {
            path: AppRoutes.adminManagePlans(),
            element: <ManagePlans />,
          },
          {
            path: AppRoutes.adminManageSubscriptions(),
            element: <ManageSubscriptions />,
          },
          {
            path: AppRoutes.adminPaymentHistory(),
            element: <PaymentHistory />,
          },
          {
            path: AppRoutes.adminCouponManagement(),
            element: <CouponManagement />,
          },
          {
            path: AppRoutes.adminJobOpenings(),
            element: <JobOpenings />,
          },
          {
            path: AppRoutes.adminAddNewJob(),
            element: <AddNewJob />,
          },
          {
            path: AppRoutes.adminApplications(),
            element: <Applications />,
          },
          {
            path: AppRoutes.adminAllUsers(),
            element: <AllUsers />,
          },
          {
            path: AppRoutes.adminAddUser(),
            element: <AddUser />,
          },
          {
            path: AppRoutes.adminProfile(),
            element: <Profile />,
          },
          {
            path: AppRoutes.adminSettings(),
            element: <AdminSettings />,
          },
          {
            path: AppRoutes.editor(),
            element: <Editor />,
          },
        ],
      },
    ],
  },
  
  {
    path: "/user",
    element: <UserAdminLayout />,
    children: [
      {
        element: <UserAdminRoute />,
        children: [
          { path: "app/", element: <UserAdminDashboard /> },
          { path: "app/dashboard", element: <UserAdminDashboard /> },
          { path: "app/recommendation", element: <UserAdminRecommendation /> },
          { path: "app/research-hub", element: <UserAdminResearchHub /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
