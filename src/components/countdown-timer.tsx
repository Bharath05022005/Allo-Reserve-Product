"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { getTimeRemaining } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  expiresAt: string;
  onExpired?: () => void;
};

export function CountdownTimer({ expiresAt, onExpired }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTimeLeft(remaining);

      if (remaining.expired) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const percent = Math.max(
    0,
    (timeLeft.total / (10 * 60 * 1000)) * 100
  );
  const isUrgent = timeLeft.minutes < 2;

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <span className="font-semibold">Reservation Expired</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition-all duration-500",
        isUrgent
          ? "border-red-500/40 bg-red-500/10 animate-pulse"
          : "border-amber-500/30 bg-amber-500/10"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock
            className={cn(
              "h-4 w-4",
              isUrgent ? "text-red-400 animate-pulse" : "text-amber-400"
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              isUrgent ? "text-red-400" : "text-amber-400"
            )}
          >
            Reserved for
          </span>
        </div>
        <span
          className={cn(
            "font-mono text-2xl font-bold tabular-nums",
            isUrgent ? "text-red-300" : "text-amber-300"
          )}
        >
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isUrgent
              ? "bg-gradient-to-r from-red-500 to-rose-400"
              : "bg-gradient-to-r from-amber-500 to-yellow-400"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
