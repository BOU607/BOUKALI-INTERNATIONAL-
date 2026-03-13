import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { addSeller } from "@/lib/sellers-persist";
import type { Seller } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name: string;
      email: string;
      password: string;
      businessName: string;
      phone: string;
    };
    const { name, email, password, businessName, phone } = body;
    if (!name?.trim() || !email?.trim() || !password?.trim() || !businessName?.trim()) {
      return NextResponse.json(
        { error: "Name, email, password, and business name are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    const passwordHash = await hash(password, 10);
    const seller: Seller = {
      id: `sel-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      businessName: businessName.trim(),
      phone: (phone ?? "").trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await addSeller(seller);
    return NextResponse.json({
      id: seller.id,
      message: "Registration successful. Your account is pending approval. You will be able to add products once approved.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
