"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Package,
  Warehouse,
  ShoppingBag,
  AlertCircle,
  Hash,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/countdown-timer";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ReservationData } from "@/types";

type Props = {
  reservationId: string;
};

type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED";

export function ReservationDetail({ reservationId }: Props) {
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [uiStatus, setUiStatus] = useState<ReservationStatus>("PENDING");
  const [loading, setLoading] = useState<"confirm" | "release" | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchReservation = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`);
      const json = await res.json();
      if (!res.ok) {
        setFetchError(json.error || "Failed to load reservation");
        return;
      }
      setReservation(json.data);
      setUiStatus(json.data.status);
    } catch {
      setFetchError("Network error. Please try again.");
    }
  }, [reservationId]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  const handleConfirm = async () => {
    setLoading("confirm");
    try {
      const res = await fetch(`/api/reservations/${reservationId}/confirm`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 410) {
          setUiStatus("EXPIRED");
          toast({
            title: "Reservation Expired",
            description:
              "Your reservation has expired. The stock has been released.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(json.error || "Confirmation failed");
      }

      setReservation(json.data);
      setUiStatus("CONFIRMED");
      toast({
        title: "Order Confirmed! 🎉",
        description: "Your purchase is confirmed. Thank you!",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Confirmation Failed",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRelease = async () => {
    setLoading("release");
    try {
      const res = await fetch(`/api/reservations/${reservationId}/release`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Release failed");
      }

      setReservation(json.data);
      setUiStatus("RELEASED");
      toast({
        title: "Reservation Cancelled",
        description: "Stock has been released back to inventory.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Cancellation Failed",
        description:
          err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExpired = useCallback(() => {
    setUiStatus("EXPIRED");
    toast({
      title: "Reservation Expired",
      description: "Your hold has expired. Stock has been released.",
      variant: "destructive",
    });
  }, []);

  if (!reservation && !fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading reservation...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Reservation Not Found
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {fetchError || "This reservation does not exist."}
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalPrice =
    Number(reservation.product.price) * reservation.quantity;

  function StatusBanner() {
    switch (uiStatus) {
      case "CONFIRMED":
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-emerald-700 text-lg">
                Order Confirmed
              </p>
              <p className="text-emerald-600/70 text-sm">
                Stock permanently reduced. Thank you for your purchase!
              </p>
            </div>
          </div>
        );
      case "RELEASED":
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-500/30 bg-slate-500/10 p-5">
            <XCircle className="h-8 w-8 text-slate-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-700 text-lg">
                Reservation Cancelled
              </p>
              <p className="text-slate-500 text-sm">
                Stock has been released back to inventory.
              </p>
            </div>
          </div>
        );
      case "EXPIRED":
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <AlertCircle className="h-8 w-8 text-red-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-red-700 text-lg">
                Reservation Expired
              </p>
              <p className="text-red-500/70 text-sm">
                Your 10-minute hold has expired. Stock has been released.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[#f8f9fc]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.05),rgba(255,255,255,0))]" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reservation Details
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-mono uppercase tracking-tighter">{reservation.id}</span>
          </div>
        </div>

        <div className="mb-6">
          {uiStatus === "CONFIRMED" && (
            <Badge variant="success" className="text-sm px-3 py-1">
              ✓ Confirmed
            </Badge>
          )}
          {uiStatus === "RELEASED" && (
            <Badge variant="outline" className="text-sm px-3 py-1 text-slate-400">
              Released
            </Badge>
          )}
          {uiStatus === "EXPIRED" && (
            <Badge variant="danger" className="text-sm px-3 py-1">
              Expired
            </Badge>
          )}
          {uiStatus === "PENDING" && (
            <Badge variant="warning" className="text-sm px-3 py-1 animate-pulse">
              Pending · Expires Soon
            </Badge>
          )}
        </div>

        {uiStatus !== "PENDING" && (
          <div className="mb-6">
            <StatusBanner />
          </div>
        )}

        {uiStatus === "PENDING" && (
          <div className="mb-6">
            <CountdownTimer
              expiresAt={reservation.expiresAt}
              onExpired={handleExpired}
            />
          </div>
        )}

        <Card className="mb-6 bg-white rounded-3xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-xl font-black text-slate-900">Order Summary</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Review your reservation before confirming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {reservation.product.imageUrl ? (
                  <img src={reservation.product.imageUrl} alt={reservation.product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-indigo-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {reservation.product.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  SKU: {reservation.product.sku}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-slate-900">
                  {formatCurrency(reservation.product.price)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per unit</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <Warehouse className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {reservation.warehouse.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {reservation.warehouse.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                <p className="text-2xl font-black text-slate-900">
                  {reservation.quantity}
                  <span className="text-xs text-slate-400 font-bold uppercase ml-1.5 tracking-wide">
                    unit{reservation.quantity > 1 ? "s" : ""}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-2xl font-black text-indigo-600">
                  {formatCurrency(totalPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
              <Calendar className="h-3 w-3" />
              Created {formatDate(reservation.createdAt)}
            </div>
          </CardContent>
        </Card>

        {uiStatus === "PENDING" && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="destructive"
              onClick={handleRelease}
              isLoading={loading === "release"}
              disabled={loading !== null}
              id="btn-cancel-reservation"
              size="lg"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirm}
              isLoading={loading === "confirm"}
              disabled={loading !== null}
              id="btn-confirm-reservation"
              size="lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Purchase
            </Button>
          </div>
        )}

        {(uiStatus === "CONFIRMED" ||
          uiStatus === "RELEASED" ||
          uiStatus === "EXPIRED") && (
          <Link href="/" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
