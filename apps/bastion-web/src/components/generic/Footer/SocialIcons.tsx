import { Config } from "@/utils/config";
import { SvgInstagram, SvgLinkedIn, SvgSpotify, SvgTwitter, SvgYoutube } from "@/utils/icons";

import { Link } from "react-router-dom"; // Make sure Link is imported

// Mapping object for SVG components
const SocialSvgMap = {
  twitter: SvgTwitter,
  linkedin: SvgLinkedIn,
  instagram: SvgInstagram,
  youtube: SvgYoutube,
  spotify: SvgSpotify,
};

// Condensed Social Icons Component
const SocialIcons = ({ className = "flex space-x-3" }) => {
  const { social_links } = Config;

  return (
    <div className={className}>
      <p>{Config.connect_url}</p>
      <div className="flex space-x-3">
        {Object.entries(social_links).map(([platform, url]) => {
          const SvgIcon = SocialSvgMap[platform];
          // Only render if we have a URL and an SVG component for the platform
          if (url && SvgIcon) {
            // Use Link for relative URLs, <a> for absolute/external URLs
            const isExternal = url.startsWith("http");
            const commonProps = {
              key: platform,
              to: isExternal ? undefined : url,
              href: isExternal ? url : undefined,
              target: isExternal ? "_blank" : undefined,
              rel: isExternal ? "noopener noreferrer" : undefined,
              className:
                "w-8 h-8  rounded flex items-center justify-center hover:bg-opacity-30 cursor-pointer transition-all",
              "aria-label":
                platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize first letter for label
            };

            if (isExternal) {
              return (
                <a {...commonProps}>
                  <SvgIcon />
                </a>
              );
            } else {
              return (
                <Link {...commonProps}>
                  <SvgIcon />
                </Link>
              );
            }
          }
          return null; // Don't render if missing URL or SVG
        })}
      </div>
    </div>
  );
};

export default SocialIcons;