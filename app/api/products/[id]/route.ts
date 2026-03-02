import { NextRequest, NextResponse } from "next/server";
import { getProductById, saveProduct, deleteProduct } from "@/lib/store";
import type { Product } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as Partial<Product> & { id?: string };
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated: Product = { ...product, ...body, id: product.id };
  saveProduct(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
