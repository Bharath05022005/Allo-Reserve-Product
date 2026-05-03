import { Suspense } from "react";
import { getProducts } from "@/services/reservation.service";
import { Sidebar } from "@/components/sidebar";
import { ProductCatalog } from "@/components/product-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function ProductDataFetcher() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-black text-slate-800 mb-2">
          No products found
        </h2>
        <p className="text-slate-500 text-sm font-medium">Try checking your database synchronization status.</p>
      </div>
    );
  }

  // Serialize Decimal fields for client components
  const serializedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    stocks: p.stocks.map((s) => ({
      ...s,
      availableUnits: s.totalUnits - s.reservedUnits,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      warehouse: {
        ...s.warehouse,
        createdAt: s.warehouse.createdAt.toISOString(),
        updatedAt: s.warehouse.updatedAt.toISOString(),
      },
    })),
  }));

  return <ProductCatalog products={serializedProducts} />;
}

function ProductGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-48" />
        <div className="h-10 bg-slate-100 rounded-xl w-32" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-100 bg-white p-8 animate-pulse shadow-sm"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-50 mb-6" />
            <div className="h-6 bg-slate-50 rounded-lg w-1/2 mb-3" />
            <div className="h-4 bg-slate-50 rounded-lg w-1/3 mb-10" />
            <div className="space-y-4">
              <div className="h-16 bg-slate-50 rounded-2xl" />
              <div className="h-16 bg-slate-50 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4.5rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 lg:p-16 bg-slate-50/30">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductDataFetcher />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
