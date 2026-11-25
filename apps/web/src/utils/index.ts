export const videoUrlWithEmbed = (url) =>
  `https://www.youtube.com/embed/${new URL(url).pathname.split("/").at(-1)}`;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getUserInfoToShowInPdf = (formData: any) => {
  const firstName = formData?.firstName || formData?.first_name || "";
  const lastName = formData?.lastName || formData?.last_name || "";
  const address1 = formData?.address1 || formData?.address_1 || "";
  const address2 = formData?.address2 || formData?.address_2 || "";
  const email = formData?.email || "";
  const phone = formData?.phone || "";
  const pan = formData?.panCard || formData?.pan_card_number || "";

  const fullName = `${firstName} ${lastName}`.trim();
  const address = [address1, address2].filter(Boolean).join("\n");

  return {
    // New explicit keys used by the PDF renderer
    fullName,
    address,
    email,
    mobile: phone,
    pan,

    // Backward-compat fields (if referenced elsewhere)
    name: fullName,
    address1,
    address2,
    phone,
  };
};

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatIndianNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);

export const planFeatures: Record<string, string[]> = {
  core: ["Core premium research access", "Member webinars", "Standard support", "Duration for 3 Month"],
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

export const getRenewalAmountINR = (
  planCode: string | null | undefined,
  fallbackAmount: number
) => {
  if (planCode === "core_annual") return 15000;
  if (planCode === "core") return 18750;
  return fallbackAmount;
};

export const CORE_ANNUAL_STANDARD_PRICE_INR = 18750;
export const CORE_ANNUAL_DISCOUNTED_PRICE_INR = 15000;

export const getFeatureKey = (plan: ApiPlan) => {
  if (plan.plan_code) return plan.plan_code;
  const normalized = plan.name.toLowerCase();
  if (normalized.includes("research hub")) return "research_hub";
  if (normalized.includes("annual")) return "core_annual";
  if (normalized.includes("core")) return "core";
  return plan.code;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.error("Failed to copy to clipboard", err);
    return false;
  }
};

export const COMMON_TLD_TYPOS: Record<string, string> = {
  con: "com",
  cmo: "com",
  comm: "com",
  coom: "com",
  ocm: "com",
  cpm: "com",
  vom: "com",
  xom: "com",
  nett: "net",
  orgg: "org",
  innd: "in",
};

export const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,24}$/;

export const validateEmail = (email?: string): string | null => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return "Please enter your email.";
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return "Email address is too long.";
  }

  if (trimmed.includes("..")) {
    return "Email address cannot contain consecutive dots.";
  }

  if (trimmed.includes("@.")) {
    return "Domain name cannot start with a dot.";
  }

  if (trimmed.includes(".@")) {
    return "Local part of email cannot end with a dot.";
  }

  if (trimmed.startsWith(".")) {
    return "Email cannot start with a dot.";
  }

  if (!STRICT_EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address with a proper domain (e.g. name@example.com).";
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return "Please enter a valid email address.";
  }

  const domain = parts[1];
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];

  if (COMMON_TLD_TYPOS[tld]) {
    return `Did you mean .${COMMON_TLD_TYPOS[tld]} instead of .${tld}? Please check your email domain.`;
  }

  return null;
};


