type SearchableApplication = {
  applicant_name?: string | null;
  email?: string | null;
  phone?: string | number | null;
  job_title: string;
};

export function getJobProfileCounts(applications: SearchableApplication[]) {
  const counts = new Map<string, number>();
  for (const application of applications) {
    counts.set(application.job_title, (counts.get(application.job_title) ?? 0) + 1);
  }
  return Array.from(counts, ([title, count]) => ({ title, count }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function filterApplications<T extends SearchableApplication>(
  applications: T[],
  searchQuery: string,
  jobProfile: string | null
): T[] {
  const query = searchQuery.trim().toLowerCase();
  const phoneQuery = query.replace(/\D/g, "");
  const isPhoneQuery = phoneQuery.length > 0 && /^[\d\s()+.\-]+$/.test(query);

  return applications.filter((application) => {
    if (jobProfile !== null && application.job_title !== jobProfile) return false;
    if (!query) return true;
    return [application.applicant_name, application.email, application.phone]
      .some((value) => String(value ?? "").toLowerCase().includes(query)) ||
      (isPhoneQuery && String(application.phone ?? "").replace(/\D/g, "").includes(phoneQuery));
  });
}
