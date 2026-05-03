import { NextResponse } from "next/server";
import { getWarehouses } from "@/services/reservation.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const warehouses = await getWarehouses();
    const serialized = warehouses.map((w) => ({
      ...w,
      stocks: w.stocks.map((s: any) => ({
        ...s,
        reservedUnits: s.reservedUnits,
        totalUnits: s.totalUnits,
      })),
    }));
    return NextResponse.json({ data: serialized });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
