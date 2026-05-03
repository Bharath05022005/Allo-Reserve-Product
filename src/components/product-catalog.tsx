"use client";

import { useState } from "react";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { ProductCard } from "./product-card";
import { ProductListItem } from "./product-list-item";

interface ProductCatalogProps {
  products: any[];
}

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-10 animate-in">
      {/* Header with Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-8 bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Inventory Hub</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Product <span className="text-gradient">Catalog</span>
          </h1>
          <p className="text-base text-slate-500 mt-3 max-w-xl leading-relaxed">
            Manage your global inventory with atomic precision. Real-time stock updates across all warehouses with built-in concurrency protection.
          </p>
        </div>

        <div className="flex items-center rounded-2xl border border-slate-100 p-1.5 bg-white shadow-xl shadow-slate-200/50">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
              viewMode === "grid"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
              viewMode === "list"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
