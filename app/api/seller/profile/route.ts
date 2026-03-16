import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerById, updateSeller } from "@/lib/sellers-persist";

type PayoutUpdate = {
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  swift?: string;
};

function omitPassword(seller: { passwordHash?: string; [k: string]: unknown }) {
  const { passwordHash: _, ...rest } = seller;
  return rest;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const seller = await getSellerById(session.user.id);
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  return NextResponse.json(omitPassword(seller));
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: PayoutUpdate;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const updates: PayoutUpdate = {};
  if (body.bankName !== undefined) updates.bankName = String(body.bankName).trim() || undefined;
  if (body.accountHolder !== undefined) updates.accountHolder = String(body.accountHolder).trim() || undefined;
  if (body.iban !== undefined) updates.iban = String(body.iban).trim().replace(/\s/g, "") || undefined;
  if (body.swift !== undefined) updates.swift = String(body.swift).trim().replace(/\s/g, "") || undefined;
  const updated = await updateSeller(session.user.id, updates);
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(omitPassword(updated));
}
