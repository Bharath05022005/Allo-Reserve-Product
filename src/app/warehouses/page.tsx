import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { getWarehouses } from "@/services/reservation.service";
import { LiveLatency } from "@/components/live-latency";
import { WarehouseStatus } from "@/components/warehouse-status";

export const dynamic = "force-dynamic";

async function WarehouseContent() {
  const warehouses = await getWarehouses();

  // Serialize warehouses for client component
  const serializedWarehouses = warehouses.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    stocks: w.stocks.map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      product: s.product ? {
        ...s.product,
        price: s.product.price.toString(),
        createdAt: s.product.createdAt.toISOString(),
        updatedAt: s.product.updatedAt.toISOString(),
      } : null,
    })),
  }));

  return (
    <div className="space-y-8">
      {/* Dynamic Status Section */}
      <WarehouseStatus warehouses={serializedWarehouses} />

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveLatency />
        
        {/* Quick Stats Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
            Regional Summary
          </h2>
          <div className="space-y-6">
            {serializedWarehouses.map((w) => (
              <div key={w.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-sm font-bold text-slate-900">{w.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{w.stocks.length} Products</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{w.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WarehouseSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-64 bg-white rounded-3xl border border-slate-100" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white rounded-3xl border border-slate-100" />
        <div className="h-64 bg-white rounded-3xl border border-slate-100" />
      </div>
    </div>
  );
}

export default async function WarehousesPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto animate-page-in">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Warehouse Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Real-time monitoring of global node distribution and capacity.
            </p>
          </div>

          <Suspense fallback={<WarehouseSkeleton />}>
            <WarehouseContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
