import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getTimeRemaining(expiresAt: string | Date): {
  total: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const total = new Date(expiresAt).getTime() - Date.now();
  const expired = total <= 0;
  const minutes = expired ? 0 : Math.floor((total / 1000 / 60) % 60);
  const seconds = expired ? 0 : Math.floor((total / 1000) % 60);
  return { total, minutes, seconds, expired };
}
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `***@${domain}`;
  return `${user.charAt(0)}${"*".repeat(user.length - 2)}${user.charAt(user.length - 1)}@${domain}`;
}
