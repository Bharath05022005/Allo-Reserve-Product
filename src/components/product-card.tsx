"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { ProductData, StockData } from "@/types";

type Props = {
  product: ProductData;
};

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  async function handleReserve(stock: StockData) {
    if (stock.availableUnits <= 0) {
      toast({
        title: "Insufficient Stock",
        description: `No units available at ${stock.warehouse.name}.`,
        variant: "destructive",
      });
      return;
    }

    setLoadingMap((prev) => ({ ...prev, [stock.id]: true }));
    try {
      const idempotencyKey = `${product.id}-${stock.warehouseId}-${Date.now()}`;

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: stock.warehouseId,
          quantity: 1,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast({
            title: "Out of Stock",
            description: "Sorry, this item is no longer available.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(json.error || "Reservation failed");
      }

      toast({
        title: "Reserved Successfully! 🎉",
        description: `1x ${product.name} reserved for 10 minutes.`,
        variant: "success",
      });

      router.push(`/reservations/${json.data.id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create reservation",
        variant: "destructive",
      });
    } finally {
      setLoadingMap((prev) => ({ ...prev, [stock.id]: false }));
    }
  }

  return (
    <div className="premium-card p-6 group">
      {/* Product Image & Info */}
      <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-6 transition-all duration-500">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
            <Warehouse className="h-12 w-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-4 right-4 px-3 py-1.5 glass rounded-full shadow-sm">
          <span className="text-[10px] font-bold text-slate-600 tracking-wider">
            {product.sku}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h2>
        <p className="text-sm text-slate-500 mt-2 line-clamp-1">
          High-performance inventory sync enabled
        </p>
      </div>

      {/* Warehouses */}
      <div className="space-y-5">
        {product.stocks.map((stock) => (
          <div key={stock.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-colors hover:bg-white hover:border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  {stock.warehouse.name}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {stock.availableUnits}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">Available</span>
                    <span className="text-[9px] text-slate-400 mt-1">Total: {stock.totalUnits}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handleReserve(stock)}
                isLoading={loadingMap[stock.id]}
                disabled={stock.availableUnits <= 0}
                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 text-sm shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Reserve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
