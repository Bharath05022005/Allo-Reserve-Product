"use client";

import { ShoppingCart, Package, Warehouse, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface ProductListProps {
  product: any;
}

export function ProductListItem({ product }: ProductListProps) {
  // Use the first warehouse stock for display
  const stock = product.stocks[0];
  const isOutOfStock = stock?.availableUnits <= 0;

  return (
    <div className="group premium-card p-5 animate-in">
      <div className="flex flex-col md:flex-row md:items-center gap-8">
        {/* Left: Product Info */}
        <div className="flex items-center gap-6 flex-1">
          <div className="h-24 w-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-500 overflow-hidden shadow-inner relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-10 w-10 text-slate-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{product.sku}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active SKU</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">Professional inventory reconciliation enabled.</p>
          </div>
        </div>

        {/* Middle: Warehouse Info */}
        <div className="flex flex-col gap-1 px-8 md:border-l md:border-slate-100 md:min-w-[200px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {stock?.warehouse?.name || "Global Node"}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">
              {stock?.availableUnits || 0}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-900 uppercase leading-none">Available</span>
              <span className="text-[9px] text-slate-400 mt-1 uppercase">Max {stock?.totalUnits || 0}</span>
            </div>
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="flex items-center justify-between md:justify-end gap-12 md:min-w-[320px]">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {formatCurrency(product.price)}
            </p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <div className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isOutOfStock ? "text-rose-500" : "text-emerald-500"}`}>
                {isOutOfStock ? "Out of Stock" : "Live Sync"}
              </span>
            </div>
          </div>

          <Link href={`/reservations/${product.id}`} className="block">
            <Button
              disabled={isOutOfStock}
              className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              Reserve
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
