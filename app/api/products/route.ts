import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/store";

export async function GET(req: NextRequest) {
  const products = getProducts();
  const category = req.nextUrl.searchParams.get("category")?.trim();
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();

  let result = products;
  if (category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }
  return NextResponse.json(result);
}
