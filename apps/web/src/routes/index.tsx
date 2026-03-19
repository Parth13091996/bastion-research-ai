import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { AppRoutes } from "./app-routes";

// Layouts
const ClientLayout = lazy(() => import("../layouts/ClientLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const UserAdminLayout = lazy(() => import("../layouts/UserAdminLayout"));

// Guards
const UserAdminRoute = lazy(() => import("../components/UserAdminRoute"));

// Pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Contact = lazy(() => import("../pages/Contact"));
const CareerPage = lazy(() => import("../pages/Careers"));
const SingleCareerPage = lazy(() => import("../pages/Careers/SingleCareer"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermAndCondition = lazy(() => import("../pages/TermsAndCondition"));
const Compliance = lazy(() => import("../pages/Compliance"));
const BastionCore = lazy(() => import("../pages/BastionCore"));
const SpotLights = lazy(() => import("../pages/SpotLights"));
const About = lazy(() => import("../pages/AboutUs"));
const NotFound = lazy(() => import("../pages/NotFound"));

// User Admin Pages
const UserAdminDashboard = lazy(
  () => import("@/pages/UserAdmin/app/UserDashboard")
);
const UserAdminRecommendation = lazy(
  () => import("@/pages/UserAdmin/app/RecommendationList")
);
const UserAdminResearchHub = lazy(
  () => import("@/pages/UserAdmin/app/ResearchHub")
);
const UserAdminEditProfile = lazy(
  () => import("@/pages/UserAdmin/app/EditProfile")
);
const UserAdminSubscription = lazy(
  () => import("@/pages/UserAdmin/app/UserSubscription")
);
const UserAdminTransactionHistory = lazy(
  () => import("@/pages/UserAdmin/app/TransactionHistory")
);
const UserAdminLogout = lazy(() => import("@/pages/UserAdmin/app/UserLogout"));
const ViewResearch = lazy(
  () => import("@/pages/UserAdmin/app/SingleRecommendation")
);
const PremiumWebinars = lazy(
  () => import("@/pages/UserAdmin/app/PremiumWebinars")
);
const ScratchPadList = lazy(
  () => import("@/pages/UserAdmin/app/ScratchPadList")
);
const ScratchPadView = lazy(
  () => import("@/pages/UserAdmin/app/ScratchPadView")
);
const PdfViewerPage = lazy(() => import("@/pages/UserAdmin/app/PdfViewerPage"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
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
const LeadsPage = lazy(() => import("../pages/Admin/Leads"));
const AllUsers = lazy(() => import("../pages/Admin/Users/AllUsers"));
const Profile = lazy(() => import("../pages/Admin/Users/Profile"));
const AdminSettings = lazy(() => import("../pages/Admin/Settings"));

const NewsletterManagement = lazy(
  () => import("../pages/Admin/Content/NewsletterManagement")
);
const WebinarManagement = lazy(
  () => import("../pages/Admin/Content/WebinarManagement")
);
const WebinarRegistrations = lazy(
  () => import("../pages/Admin/Content/WebinarRegistrations")
);
const RedFlagAnalytics = lazy(
  () => import("../pages/Admin/Content/RedFlagAnalytics")
);
const PodcastManagement = lazy(
  () => import("../pages/Admin/Content/PodcastManagement")
);
const NewsletterEditor = lazy(
  () => import("../pages/Admin/Content/NewsletterEditor")
);
const WebinarEditor = lazy(
  () => import("../pages/Admin/Content/WebinarEditor")
);
const PodcastEditor = lazy(
  () => import("../pages/Admin/Content/PodcastEditor")
);
const RecommendationManagement = lazy(
  () => import("../pages/Admin/Content/RecommendationManagement")
);
const TestimonialManagement = lazy(
  () => import("../pages/Admin/Content/TestimonialManagement")
);
const TestimonialEditor = lazy(
  () => import("../pages/Admin/Content/TestimonialEditor")
);
const ScratchPadManagement = lazy(
  () => import("../pages/Admin/Content/ScratchPadManagement")
);
const ScratchPadEditor = lazy(
  () => import("../pages/Admin/Content/ScratchPadEditor")
);

// Public Content Pages
const NewsletterView = lazy(
  () => import("../pages/NewsLetter/SingleNewsLetterPage")
);
const SingleWebinarPage = lazy(
  () => import("../pages/Webinars/SingleWebinarPage")
);
const SinglePodcastPage = lazy(
  () => import("../pages/Podcasts/SinglePodcastPage")
);

// Components that are used as pages
const PublicPodcastsPage = lazy(
  () => import("../pages/Podcasts/PodcastsListPage")
);
const NewsletterArchive = lazy(
  () => import("../pages/NewsLetter/NewsletterListPage")
);
const Webinar = lazy(() => import("../pages/Webinars/WebinarsListPage"));
const PortfolioRedFlagsWebinar = lazy(
  () => import("../pages/Webinars/PortfolioRedFlagsWebinar")
);
const SmartFrameworks = lazy(
  () => import("../components/generic/SmartFrameworks")
);
const ComingSoon = lazy(() => import("../components/ComingSoon"));
const IpoLandingPage = lazy(() => import("../pages/IpoLandingPage"));
const InstaLandingPage = lazy(
  () => import("../pages/SocialMediaLandingPage/InstaLandingPage")
);
const InstaLandingPage2 = lazy(
  () => import("../pages/SocialMediaLandingPage/InstaLandingPage2")
);
const RedFlagDecision = lazy(
  () => import("../pages/SocialMediaLandingPage/RedFlagDecision")
);
const IpoUserDashboardPage = lazy(
  () => import("../pages/IpoUserDashboardPage/components/IpoUserDashboard")
);

export const routes: RouteObject[] = [
  {
    element: <ClientLayout />,
    children: [
      { path: AppRoutes.home, element: <Home /> },
      { path: AppRoutes.login, element: <Login /> },
      { path: AppRoutes.forgotPassword, element: <ForgotPassword /> },
      { path: AppRoutes.resetPassword, element: <ResetPassword /> },
      { path: AppRoutes.contact, element: <Contact /> },
      { path: AppRoutes.careerPage, element: <CareerPage /> },
      { path: AppRoutes.singleCareerPage, element: <SingleCareerPage /> },
      { path: AppRoutes.refundPolicy, element: <RefundPolicy /> },
      { path: AppRoutes.privacyPolicy, element: <PrivacyPolicy /> },
      { path: AppRoutes.termAndCondition, element: <TermAndCondition /> },
      { path: AppRoutes.compliance, element: <Compliance /> },
      { path: AppRoutes.bastionCore, element: <BastionCore /> },
      { path: AppRoutes.about, element: <About /> },
      { path: AppRoutes.spotlights, element: <SpotLights /> },
      { path: AppRoutes.podcasts, element: <PublicPodcastsPage /> },
      { path: AppRoutes.newsletter, element: <NewsletterArchive /> },
      { path: AppRoutes.webinar, element: <Webinar /> },
      { path: AppRoutes.smartFrameworks, element: <SmartFrameworks /> },
      { path: AppRoutes.newsletterView, element: <NewsletterView /> },
      {
        path: AppRoutes.webinarView,
        element: <SingleWebinarPage isPremium={false} />,
      },
      { path: AppRoutes.podcastView, element: <SinglePodcastPage /> },
      { path: AppRoutes.scratchPadView, element: <ScratchPadView /> },
      { path: AppRoutes.dashboard, element: <Dashboard /> },
    ],
  },
  {
    path: AppRoutes.comingSoon,
    element: <ComingSoon />,
  },
  {
    path: AppRoutes.webinarRedFlagsLanding,
    element: <PortfolioRedFlagsWebinar />,
  },
  {
    path: AppRoutes.ipoLanding,
    element: <IpoLandingPage />,
  },
  {
    path: AppRoutes.instaLanding,
    element: <InstaLandingPage />,
  },
  {
    path: AppRoutes.instaLanding2,
    element: <InstaLandingPage2 />,
  },
  {
    path: AppRoutes.redFlagDecision,
    element: <RedFlagDecision />,
  },
  {
    element: <AdminLayout />,
    path: AppRoutes.admin,
    children: [
      {
        index: true,
        element: <Navigate to={AppRoutes.adminDashboard} replace />,
      },
      {
        path: AppRoutes.adminDashboard,
        element: <AdminDashboard />,
      },
      {
        path: AppRoutes.adminManageMembers,
        element: <ManageMembers />,
      },
      {
        path: AppRoutes.adminManagePlans,
        element: <ManagePlans />,
      },
      {
        path: AppRoutes.adminManageSubscriptions,
        element: <ManageSubscriptions />,
      },
      {
        path: AppRoutes.adminPaymentHistory,
        element: <PaymentHistory />,
      },
      {
        path: AppRoutes.adminCouponManagement,
        element: <CouponManagement />,
      },
      {
        path: AppRoutes.adminJobOpenings,
        element: <JobOpenings />,
      },
      {
        path: AppRoutes.adminAddNewJob,
        element: <AddNewJob />,
      },
      {
        path: AppRoutes.adminApplications,
        element: <Applications />,
      },
      {
        path: AppRoutes.adminLeads,
        element: <LeadsPage />,
      },
      {
        path: AppRoutes.adminAllUsers,
        element: <AllUsers />,
      },
      {
        path: AppRoutes.adminProfile,
        element: <Profile />,
      },
      {
        path: AppRoutes.adminSettings,
        element: <AdminSettings />,
      },
      {
        path: AppRoutes.adminNewsletterManagement,
        element: <NewsletterManagement />,
      },
      {
        path: AppRoutes.adminWebinarManagement,
        element: <WebinarManagement />,
      },
      {
        path: AppRoutes.adminWebinarRegistrations,
        element: <WebinarRegistrations />,
      },
      {
        path: AppRoutes.adminRedFlagAnalytics,
        element: <RedFlagAnalytics />,
      },
      {
        path: AppRoutes.adminPodcastManagement,
        element: <PodcastManagement />,
      },
      {
        path: AppRoutes.adminRecommendationManagement,
        element: <RecommendationManagement />,
      },
      {
        path: AppRoutes.adminNewsletterCreate,
        element: <NewsletterEditor />,
      },
      {
        path: AppRoutes.adminNewsletterEdit,
        element: <NewsletterEditor />,
      },
      {
        path: AppRoutes.adminWebinarCreate,
        element: <WebinarEditor />,
      },
      {
        path: AppRoutes.adminWebinarEdit,
        element: <WebinarEditor />,
      },
      {
        path: AppRoutes.adminPodcastCreate,
        element: <PodcastEditor />,
      },
      {
        path: AppRoutes.adminPodcastEdit,
        element: <PodcastEditor />,
      },
      {
        path: AppRoutes.adminTestimonialManagement,
        element: <TestimonialManagement />,
      },
      {
        path: AppRoutes.adminTestimonialCreate,
        element: <TestimonialEditor />,
      },
      {
        path: AppRoutes.adminTestimonialEdit,
        element: <TestimonialEditor />,
      },
      {
        path: "/admin/content/scratch-pad",
        element: <ScratchPadManagement />,
      },
      {
        path: AppRoutes.adminScratchPadCreate,
        element: <ScratchPadEditor />,
      },
      {
        path: AppRoutes.adminScratchPadEdit,
        element: <ScratchPadEditor />,
      },
    ],
  },
  {
    path: AppRoutes.ipoUserDashboard,
    element: <IpoUserDashboardPage />,
  },

  {
    path: "/user",
    element: <UserAdminLayout />,
    children: [
      {
        element: <UserAdminRoute />,
        children: [
          {
            path: AppRoutes.premiumWebinars,
            element: <PremiumWebinars />,
          },
          {
            path: AppRoutes.singlePremiumWebinar,
            element: <SingleWebinarPage isPremium={true} />,
          },
          { path: "app/", element: <UserAdminDashboard /> },
          { path: "app/dashboard", element: <UserAdminDashboard /> },
          { path: "app/recommendation", element: <UserAdminRecommendation /> },
          {
            path: "app/view-research/:symbol",
            element: <ViewResearch />,
          },
          { path: "app/research-hub", element: <UserAdminResearchHub /> },
          { path: "app/scratch-pad", element: <ScratchPadList /> },
          { path: "app/scratch-pad/:id", element: <ScratchPadView /> },
          { path: "app/pdf-viewer", element: <PdfViewerPage /> },
          {
            path: "app/account/edit-profile",
            element: <UserAdminEditProfile />,
          },
          {
            path: "app/account/subscription",
            element: <UserAdminSubscription />,
          },
          {
            path: "app/account/transactions",
            element: <UserAdminTransactionHistory />,
          },
          { path: "app/account/logout", element: <UserAdminLogout /> },
          // { path: "app/ipo-dashboard", element: <IpoUserDashboardPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
