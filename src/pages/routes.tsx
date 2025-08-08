import { lazy } from "react";

const Home = lazy(() => import("../pages/Home"));
// const AboutUs = lazy(() => import("../pages/AboutUs"));
// const Spotlight = lazy(() => import("../pages/Spotlight"));
// const Quant = lazy(() => import("../pages/Quant"));
const Contact = lazy(() => import("../pages/Contact"));
// const Career = lazy(() => import("../pages/Career"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermAndCondition = lazy(() => import("../pages/TermAndCondition"));
const Compliance = lazy(() => import("../pages/Complaince"));
//g const Blog = lazy(() => import("../pages/Blog"));
const Login = lazy(() => import("../pages/Login"));
const BastionCore = lazy(() => import("../pages/BastionCore.tsx"));
const Register = lazy(() => import("../pages/Register"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const Subscription = lazy(() => import("../pages/Subscription"));
const PodcastsGrid = lazy(() => import("../components/generic/PodcastsGrid.tsx"));
// const PodcatsBlog = lazy(() => import("../components/generic/PodcatsBlog"));
const SpotLights = lazy(() => import("../pages/SpotLights.tsx"));

// Define App Routes
export const AppRoutes = {
  home: () => "/",
  aboutUs: () => "/about-us",
  contact: () => "/contact",
  career: () => "/career",
  refundPolicy: () => "/refund-policy",
  privacyPolicy: () => "/privacy-policy", // Ensure this matches Footer link
  termAndCondition: () => "/terms-and-conditions",
  compliance: () => "/compliance",
  blog: () => "/blog",
  login: () => "/login",
  BastionCore: () => "/bastion-core",
  register: () => "/register",
  editProfile: () => "/edit-profile",
  subscription: () => "/subscription",
  newslettersArchive: () => "/newsletters-archive", // Added for Header dropdown
  podcast: () => "/podcast", // Added for Header dropdown
  webinars: () => "/webinars", // Added for Header dropdown
  PodcastsGrid: () => "/podcasts", // Added for PodcastsGrid component
  // PodcatsBlog: () => "/podcats-blog", // Added for PodcatsBlog component
  SpotLights: () => "/spotlights", // Added for Spotlight page
  // Add more route names and path functions as needed
};

// Define the main application routes array
// Index route comes first
export const routes = [
  // Public Routes
  { Component: Home, index: true }, // Uses index: true instead of path for "/"
  // { Component: AboutUs, path: AppRoutes.aboutUs() },
  // { Component: Spotlight, path: AppRoutes.spotlight() },
  // { Component: Quant, path: AppRoutes.quant() },
  { Component: Contact, path: AppRoutes.contact() },
  // { Component: Career, path: AppRoutes.career() },
  { Component: RefundPolicy, path: AppRoutes.refundPolicy() },
  { Component: PrivacyPolicy, path: AppRoutes.privacyPolicy() },
  { Component: TermAndCondition, path: AppRoutes.termAndCondition() },
  { Component: Compliance, path: AppRoutes.compliance() },
  // { Component: Blog, path: AppRoutes.blog() },
  { Component: Login, path: AppRoutes.login() },
  // { Component: BastionCore, path: AppRoutes.bastionCore() },
  { Component: Register, path: AppRoutes.register() },
  // Protected Routes
  { Component: EditProfile, path: AppRoutes.editProfile(), isProtected: true },
  {
    Component: Subscription,
    path: AppRoutes.subscription(),
    isProtected: true,
  },
  {
    Component: PodcastsGrid,
    path: AppRoutes.PodcastsGrid(),

  },
  {
    Component: SpotLights,
    path: AppRoutes.SpotLights(),

  },
  // Additional routes for Header dropdown (assuming they are public pages)
  // {
  //   Component: lazy(() => import("./pages/NewslettersArchive")),
  //   path: AppRoutes.newslettersArchive(),
  // }, // Assuming component exists
  // Podcast component does not exist
  // {
  //   Component: lazy(() => import("./pages/Webinars")),
  //   path: AppRoutes.webinars(),
  // }, // Assuming component exists
  // Catch-all route should be handled in App.tsx
];

// Export components if needed elsewhere directly (optional if only using via routes)
// export { Home, AboutUs, ... };
