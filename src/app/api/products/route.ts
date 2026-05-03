import { NextResponse } from "next/server";
import { getProducts } from "@/services/reservation.service";

export async function GET() {
  try {
    const products = await getProducts();

    // Transform: add computed availableUnits per stock entry
    const data = products.map((product) => ({
      ...product,
      price: product.price.toString(),
      stocks: product.stocks.map((stock) => ({
        ...stock,
        availableUnits: stock.totalUnits - stock.reservedUnits,
      })),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
