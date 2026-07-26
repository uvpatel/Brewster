"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/pos/pos-types";

interface ProductGridProps {
  searchTerm: string;
}

export function ProductGrid({ searchTerm }: ProductGridProps) {
  const { categories, products, addToCart } = usePOS();
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");

  const activeProducts = products.filter((p) => p.status !== "ARCHIVED");

  const filteredProducts = activeProducts.filter((product) => {
    const matchesCat = selectedCatId === "ALL" || product.categoryId === selectedCatId;
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-4 p-4 overflow-hidden">
      {/* Category Tabs with dynamic colors */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Button
          variant={selectedCatId === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCatId("ALL")}
          className="rounded-full px-4 text-xs font-bold shrink-0"
        >
          All Items ({activeProducts.length})
        </Button>

        {categories
          .filter((c) => c.status !== "ARCHIVED")
          .map((cat) => {
            const isSelected = selectedCatId === cat.id;
            const count = activeProducts.filter((p) => p.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                style={{
                  backgroundColor: isSelected ? cat.color : "transparent",
                  borderColor: cat.color,
                  color: isSelected ? "#ffffff" : cat.color,
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all shrink-0 hover:opacity-90 ${
                  isSelected ? "shadow-sm" : "bg-card"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className="rounded-full px-1.5 py-0.2 text-[10px]"
                  style={{
                    backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : `${cat.color}20`,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-muted-foreground">No products found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const catColor = product.categoryColor || "#6366f1";

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative flex flex-col justify-between rounded-xl border bg-card p-3 shadow-xs transition-all hover:border-primary hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${catColor}15`,
                          color: catColor,
                          borderColor: `${catColor}40`,
                        }}
                        className="text-[10px] font-bold"
                      >
                        {product.categoryName || "Item"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase">{product.unitOfMeasure}</span>
                    </div>

                    <h4 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-base font-bold text-foreground">₹{product.price.toFixed(2)}</span>
                    <Button
                      size="icon"
                      className="h-7 w-7 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
