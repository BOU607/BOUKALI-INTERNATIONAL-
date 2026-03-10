import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/store";

export async function GET(req: NextRequest) {
  let jobs = getJobs();
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  const category = req.nextUrl.searchParams.get("category")?.trim();

  if (category) {
    jobs = jobs.filter((j) => (j.category || "Other") === category);
  }
  if (q) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    );
  }
  return NextResponse.json(jobs);
}
