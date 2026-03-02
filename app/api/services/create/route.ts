import { NextRequest, NextResponse } from "next/server";
import { saveService } from "@/lib/store";
import type { Service } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<Service, "id" | "createdAt">;
  const id = String(Date.now());
  const service: Service = {
    ...body,
    id,
    createdAt: new Date().toISOString(),
  };
  saveService(service);
  return NextResponse.json(service);
}
