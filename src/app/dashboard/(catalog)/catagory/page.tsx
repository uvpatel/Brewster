"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingBasket, Plus, Search, Edit2, Trash2 } from "lucide-react";
import type { Category } from "@/lib/pos/pos-types";

export default function CategoryPage() {
  const { categories, addCategory } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#f97316");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name,
      color,
      status: "ACTIVE",
    });

    setName("");
    setColor("#f97316");
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBasket className="h-7 w-7 text-cyan-600" />
            Product Category Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure product categories and assigned colors that reflect across POS product cards, tabs, and reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full border shadow-xs flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name.charAt(0)}
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground">{cat.name}</h4>
                <span className="text-xs font-mono text-muted-foreground">{cat.color}</span>
              </div>
            </div>

            <Badge
              variant="outline"
              style={{
                backgroundColor: `${cat.color}15`,
                color: cat.color,
                borderColor: `${cat.color}40`,
              }}
              className="text-xs font-bold"
            >
              Active
            </Badge>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Product Category</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category Name *</label>
              <Input
                placeholder="e.g. Cold Beverages"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category Color *</label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer bg-card"
                />
                <span className="text-sm font-mono font-bold">{color}</span>
              </div>
            </div>

            <Button type="submit" className="w-full font-bold">
              Save Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
