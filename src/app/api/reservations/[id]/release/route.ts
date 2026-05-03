import { NextRequest, NextResponse } from "next/server";
import { releaseReservation } from "@/services/reservation.service";

type Params = { params: Promise<{ id: string }> };

// POST /api/reservations/:id/release
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await releaseReservation(id);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.status }
      );
    }

    return NextResponse.json({
      data: {
        ...result.reservation,
        product: {
          ...result.reservation.product,
          price: result.reservation.product.price.toString(),
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/reservations/:id/release]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
