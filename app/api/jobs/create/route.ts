import { NextRequest, NextResponse } from "next/server";
import { saveJob } from "@/lib/store";
import type { Job } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<Job, "id" | "createdAt">;
  const id = String(Date.now());
  const job: Job = {
    ...body,
    category: body.category || "Other",
    id,
    createdAt: new Date().toISOString(),
  };
  saveJob(job);
  return NextResponse.json(job);
}
