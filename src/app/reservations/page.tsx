import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { getReservations } from "@/services/reservation.service";
import { RefreshButton } from "@/components/refresh-button";

export const dynamic = "force-dynamic";

async function ReservationsTable() {
  const reservations = await getReservations();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warehouse</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                  No active reservations found.
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                      res.status === "PENDING" 
                        ? "bg-amber-50 text-amber-600 border-amber-200" 
                        : res.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-mono text-[10px] text-slate-400 uppercase font-bold">
                    #{res.id.slice(-8)}
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-bold text-slate-900 text-sm">{res.product.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SKU: {res.product.sku}</div>
                  </td>
                  <td className="px-6 py-6 text-sm text-slate-600 font-medium">
                    {res.warehouse.name}
                  </td>
                  <td className="px-6 py-6 text-right font-black text-slate-900 text-lg">
                    {res.quantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationsSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-100" />
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function ReservationsPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-12 bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto animate-page-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Reservations Dashboard
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Live monitoring of all atomic locks across the global network.
              </p>
            </div>
            
            <RefreshButton />
          </div>

          <Suspense fallback={<ReservationsSkeleton />}>
            <ReservationsTable />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
