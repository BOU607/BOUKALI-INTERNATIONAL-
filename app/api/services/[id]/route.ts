import { NextRequest, NextResponse } from "next/server";
import { getServiceById, saveService, deleteService } from "@/lib/store";
import type { Service } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = getServiceById(id);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(service);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as Partial<Service> & { id?: string };
  const service = getServiceById(id);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated: Service = { ...service, ...body, id: service.id };
  saveService(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteService(id);
  return NextResponse.json({ ok: true });
}
