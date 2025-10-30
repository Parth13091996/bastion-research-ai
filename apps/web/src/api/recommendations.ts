import { getPublicSettings } from "./settings";

export const getAdminRecommendationsSheetUrl = async () => {
  const s = await getPublicSettings();
  return (
    s.recommendation_sheet_url ||
    "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=0#gid=0"
  );
};

export const getLiveRecommendationsSheetUrl = async () => {
  const s = await getPublicSettings();
  return (
    s.live_recommendation_sheet_url ||
    "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=1899227714#gid=1899227714"
  );
};
