import { NextResponse } from "next/server";
import { getWarehouses } from "@/services/reservation.service";

export async function GET() {
  try {
    const warehouses = await getWarehouses();
    return NextResponse.json({ data: warehouses });
  } catch (error) {
    console.error("[GET /api/warehouses]", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}
