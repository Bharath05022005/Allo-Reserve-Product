import { NextRequest, NextResponse } from "next/server";
import { createReservationSchema } from "@/lib/validations";
import { createReservation } from "@/services/reservation.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = createReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // Extract idempotency key from headers (bonus feature)
    const idempotencyKey =
      request.headers.get("Idempotency-Key") ?? undefined;

    const result = await createReservation(parsed.data, idempotencyKey);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.status }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...result.reservation,
          product: {
            ...result.reservation.product,
            price: result.reservation.product.price.toString(),
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reservations]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
