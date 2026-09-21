import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Standard admin date format → "13 Jul 2026" */
export const formatAdminDate = (value?: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";

  const match = dateStr.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
  let parsedDate: Date;

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    parsedDate = new Date(year, month, day);
  } else {
    parsedDate = new Date(dateStr);
  }

  if (isNaN(parsedDate.getTime())) return dateStr;

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
