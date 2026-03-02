import { NextRequest, NextResponse } from "next/server";
import { getJobById, saveJob, deleteJob } from "@/lib/store";
import type { Job } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as Partial<Job> & { id?: string };
  const job = getJobById(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated: Job = { ...job, ...body, id: job.id };
  saveJob(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteJob(id);
  return NextResponse.json({ ok: true });
}
