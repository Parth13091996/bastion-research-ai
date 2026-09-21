import { Crown, Shield } from "lucide-react";

const SidebarProfile = ({ isCollapsed, profile }) => {
  return (
    <div className="mt-auto p-4 border-t border-gray-700">
      {!isCollapsed ? (
        <div className="space-y-3">
          <div className="flex items-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
              </div>
            )}
            <div className="ml-3 text-white">
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-gray-300 capitalize">
                {profile.role.split("_").join(" ")}
              </p>
            </div>
          </div>
          {/* Premium Status & User Type */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {profile.currentPlan !== "freemium" ? (
                <>
                  <Crown className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">
                    Premium Member
                  </span>
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">No Active Plan</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center relative">
              <span className="text-sm font-medium text-white">
                {profile.name[0] || "B"}
              </span>
              {profile.is_premium && (
                <Crown className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarProfile;
