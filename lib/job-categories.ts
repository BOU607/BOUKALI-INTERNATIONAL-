/** Job categories for tabs/filter. Keys used in URL and storage. */
export const JOB_CATEGORIES = [
  "Sales",
  "Marketing",
  "Operations",
  "IT & Tech",
  "Administration",
  "Customer Service",
  "Driving & Logistics",
  "Construction & Trades",
  "Healthcare",
  "Retail",
  "Other",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const JOB_CATEGORY_KEYS: Record<string, string> = {
  Sales: "jobs.category.sales",
  Marketing: "jobs.category.marketing",
  Operations: "jobs.category.operations",
  "IT & Tech": "jobs.category.itTech",
  Administration: "jobs.category.administration",
  "Customer Service": "jobs.category.customerService",
  "Driving & Logistics": "jobs.category.drivingLogistics",
  "Construction & Trades": "jobs.category.constructionTrades",
  Healthcare: "jobs.category.healthcare",
  Retail: "jobs.category.retail",
  Other: "jobs.category.other",
};
