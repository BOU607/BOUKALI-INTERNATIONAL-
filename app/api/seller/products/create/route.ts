import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerById } from "@/lib/sellers-persist";
import { addProduct } from "@/lib/products-persist";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const seller = await getSellerById(session.user.id);
  if (!seller || seller.status !== "approved") {
    return NextResponse.json({ error: "Seller account not approved" }, { status: 403 });
  }
  const body = (await req.json()) as Omit<Product, "id" | "sellerId" | "createdAt">;
  const { name, description, price, image, category, stock } = body;
  if (!name?.trim() || !description?.trim() || typeof price !== "number" || price < 0) {
    return NextResponse.json({ error: "Name, description, and valid price required" }, { status: 400 });
  }
  const validCategory = CATEGORIES.includes(category as (typeof CATEGORIES)[number])
    ? category
    : CATEGORIES[0];
  const product: Product = {
    id: `prod-${Date.now()}`,
    sellerId: session.user.id,
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    image: typeof image === "string" ? image.trim() : "",
    category: validCategory,
    stock: Math.max(0, Math.floor(Number(stock) || 0)),
    createdAt: new Date().toISOString(),
  };
  await addProduct(product);
  return NextResponse.json(product);
}
