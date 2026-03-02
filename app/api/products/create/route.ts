import { NextRequest, NextResponse } from "next/server";
import { saveProduct } from "@/lib/store";
import type { Product } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<Product, "id" | "createdAt">;
  const id = String(Date.now());
  const product: Product = {
    ...body,
    id,
    createdAt: new Date().toISOString(),
  };
  saveProduct(product);
  return NextResponse.json(product);
}
