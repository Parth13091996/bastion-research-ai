export const videoUrlWithEmbed = (url) =>
  `https://www.youtube.com/embed/${new URL(url).pathname.split("/").at(-1)}`;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getUserInfoToShowInPdf = (formData: any) => {
  const actualAddress = `
  Name: ${formData?.firstName || ""} ${formData?.lastName || ""}\n
  PAN: ${formData?.panCard || ""}\n
  Address: ${formData?.address1 || ""}\n
  ${formData?.address2 || ""}\n
  Email: ${formData?.email || ""}\n
  Phone Number: ${formData?.phone || ""}
  `;
  return actualAddress;
};


export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const planFeatures: Record<string, string[]> = {
  core: ["Core premium research access", "Member webinars", "Standard support"],
  core_annual: [
    "All CORE features",
    "Annual insights bundle",
    "Early feature access",
    "Priority support",
  ],
  research_hub: [
    "All CORE + CORE Annual features",
    "Research Hub exclusives",
    "Advanced tools & datasets",
  ],
};

export const getFeatureKey = (plan: ApiPlan) => {
  if (plan.plan_code) return plan.plan_code;
  const normalized = plan.name.toLowerCase();
  if (normalized.includes("research hub")) return "research_hub";
  if (normalized.includes("annual")) return "core_annual";
  if (normalized.includes("core")) return "core";
  return plan.code;
};