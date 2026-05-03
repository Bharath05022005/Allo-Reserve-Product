import { NextRequest, NextResponse } from "next/server";
import {
  confirmReservation,
  releaseReservation,
  getReservation,
} from "@/services/reservation.service";

type Params = { params: Promise<{ id: string }> };

// GET /api/reservations/:id
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const reservation = await getReservation(id);

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...reservation,
        product: {
          ...reservation.product,
          price: reservation.product.price.toString(),
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/reservations/:id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
