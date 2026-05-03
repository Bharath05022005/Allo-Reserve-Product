import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { TopLoader } from "@/components/top-loader";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlloInventory — Real-Time Inventory Reservation",
  description:
    "Production-ready inventory reservation system with real-time stock updates, concurrency-safe reservations, and automatic expiry.",
  keywords: ["inventory", "reservation", "e-commerce", "stock management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen`}
      >
        <AuthProvider>
          <TopLoader />
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
