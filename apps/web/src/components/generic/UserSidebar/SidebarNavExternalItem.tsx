const SidebarNavExternalItem = ({
  item,
  isCollapsed,
  profile,
  setShowPricing,
  setIsMobileOpen,
}) => {
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
      {!isCollapsed && <span className="ml-3">{item.name}</span>}
    </div>
  );
};

export default SidebarNavExternalItem;
