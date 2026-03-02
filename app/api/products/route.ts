import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/store";

export async function GET(req: NextRequest) {
  const products = getProducts();
  const category = req.nextUrl.searchParams.get("category")?.trim();
  if (category) {
    const filtered = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    return NextResponse.json(filtered);
  }
  return NextResponse.json(products);
}
