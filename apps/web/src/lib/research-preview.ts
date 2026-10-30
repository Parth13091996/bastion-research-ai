export function researchPreviewUrl(url?: string): string | undefined {
  if (!url?.startsWith('supabase://')) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://dev-api.bastionresearch.in').replace(
    /\/$/,
    '',
  );
  return `${base}/api/staff/research-preview?uri=${encodeURIComponent(url)}`;
}
