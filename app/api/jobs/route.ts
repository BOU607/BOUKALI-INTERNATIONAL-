import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/store";

export async function GET(req: NextRequest) {
  const jobs = getJobs();
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (q) {
    const filtered = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    );
    return NextResponse.json(filtered);
  }
  return NextResponse.json(jobs);
}
