import { Crown, Shield } from "lucide-react";
import ChartDashboard from "./ChartDashboard";
import LatestUpdates from "./LatestUpdates";
import RecentRecommendations from "./RecentRecommendations";
import { useAuth } from "@/contexts/AuthContext";

const UserDashboard = () => {
  const { user, subscription } = useAuth();

  // 👤 User Profile
  // 👤 Check Push 20 Nov Late Night
  const profile = {
    name: user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.username ||
        "User"
      : "Guest",
    role: user?.role || "User",
    avatarUrl: null,
    is_premium: subscription?.is_premium || false,
    currentPlan: subscription?.currentPlan || null,
  };

  // 🌅 Greeting
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // 📅 Format date safely
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 🪪 Member since
  const memberSince: string = user?.created_at
    ? formatDate(user.created_at)
    : "N/A";

  // 🔁 Renewal button logic (90 days for normal, 1 year for premium)
  const getRenewButtonState = (
    updatedAt?: string | null,
    isPremium?: boolean
  ) => {
    if (!updatedAt) return { show: false, color: "", daysLeft: null };

    const updatedDate = new Date(updatedAt);
    const expirationDate = new Date(updatedDate);

    // 🕒 Expiry duration: 1 year for premium users, 90 days for others
    if (isPremium) {
      expirationDate.setFullYear(updatedDate.getFullYear() + 1);
    } else {
      expirationDate.setDate(updatedDate.getDate() + 90);
    }

    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // remaining days

    if (diffDays > 15) return { show: false, color: "", daysLeft: diffDays }; // hide until last 15 days

    // 🎨 Color scheme based on urgency
    let colorClass = "bg-blue-600 hover:bg-blue-700"; // 15–11 days
    if (diffDays <= 10 && diffDays > 5)
      colorClass = "bg-orange-500 hover:bg-orange-600"; // 10–6 days
    else if (diffDays <= 5) colorClass = "bg-red-600 hover:bg-red-700"; // 5–0 days

    return { show: true, color: colorClass, daysLeft: diffDays };
  };

  const { show, color, daysLeft } = getRenewButtonState(
    user?.updated_at,
    profile.is_premium
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {profile.name}!
              </h1>
            </div>
            <div className="flex items-center gap-1">
              {profile.is_premium ? (
                <>
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <span className="text-s text-yellow-400 font-medium">
                    Premium Member
                  </span>
                </>
              ) : (
                <>
                  <Shield className="h-6 w-6 text-gray-400" />
                  <span className="text-s text-gray-400">No Active Plan</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {user?.first_name?.[0] || user?.username?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {user?.email}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 capitalize">
                  {user?.role || "User"}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Member since</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {memberSince}
                </p>

                {/* Optional: Days left indicator */}
                {daysLeft !== null &&
                  // <p className="text-xs text-gray-500 mt-1">
                  //   {daysLeft > 0
                  //     ? `${daysLeft} days left before renewal`
                  //     : "Expired — renew now"}
                  // </p>
                  ""}

                {show && (
                  <button
                    className={`mt-1 sm:mt-2 px-3 py-1 ${color} text-white rounded-lg transition-colors text-sm sm:text-base inline-block text-center`}
                  >
                    {profile.is_premium ? "Renew Premium Plan" : "Renew Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <ChartDashboard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <RecentRecommendations />
          <LatestUpdates />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
