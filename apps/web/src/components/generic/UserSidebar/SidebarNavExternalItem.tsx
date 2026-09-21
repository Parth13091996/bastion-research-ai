const SidebarNavExternalItem = ({
  item,
  isCollapsed,
  profile,
  setShowPricing,
  setIsMobileOpen,
}) => {
  const isFreeItem = item.name === "Join WhatsApp Group" || item.name === "Subscribe to Substack";

  return (
    <div
      onClick={() => {
        if (
          profile?.currentPlan === "freemium" &&
          (item.name === "Premium Webinars" ||
            item.name === "Scratch Pad Newsletter")
        ) {
          setShowPricing(true);
          return;
        }
        setIsMobileOpen(false);
        open(item.path, "_blank");
      }}
      title={isCollapsed ? item.name : undefined}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
        isCollapsed ? "justify-center" : ""
      } text-gray-200 hover:bg-red-900 cursor-pointer`}
      role="button"
      tabIndex={0}
    >
      <item.icon className="h-5 w-5" />
      {!isCollapsed && (
        <div className="ml-3 flex items-center">
          <span>{item.name}</span>
          {isFreeItem && (
            <span className="ml-2 px-2 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full shadow-lg animate-pulse">
              FREE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarNavExternalItem;
