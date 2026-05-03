import type { Metadata } from "next";
import { ReservationDetail } from "@/components/reservation-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Reservation ${id.slice(0, 8)}… — AlloInventory`,
    description: "View and manage your inventory reservation.",
  };
}

export default async function ReservationPage({ params }: Props) {
  const { id } = await params;
  return <ReservationDetail reservationId={id} />;
}
