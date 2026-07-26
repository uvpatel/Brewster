"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coffee, Plus, Search, Edit2, Trash2, FolderPlus } from "lucide-react";
import type { Product } from "@/lib/pos/pos-types";

export default function ProductPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [price, setPrice] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState<Product["unitOfMeasure"]>("PIECE");
  const [description, setDescription] = useState("");

  // On-the-fly Category creation inline modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#f97316");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setPrice("");
    setUnitOfMeasure("PIECE");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(p.price.toString());
    setUnitOfMeasure(p.unitOfMeasure);
    setDescription(p.description || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const numPrice = parseFloat(price) || 0;
    const cat = categories.find((c) => c.id === categoryId);

    if (editingId) {
      updateProduct(editingId, {
        name,
        categoryId,
        categoryName: cat?.name,
        categoryColor: cat?.color,
        price: numPrice,
        unitOfMeasure,
        description,
      });
    } else {
      addProduct({
        name,
        categoryId,
        categoryName: cat?.name,
        categoryColor: cat?.color,
        price: numPrice,
        unitOfMeasure,
        description,
        status: "ACTIVE",
      });
    }

    setIsModalOpen(false);
  };

  const handleInlineCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const created = await addCategory({
      name: newCatName,
      color: newCatColor,
      status: "ACTIVE",
    });

    setCategoryId(created.id);
    setNewCatName("");
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="h-7 w-7 text-amber-600" />
            Product Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure menu products, prices, categories, and units of measure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button onClick={handleOpenCreate} className="font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">UOM</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-3 font-bold">{p.name}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${p.categoryColor || "#f97316"}15`,
                          color: p.categoryColor || "#f97316",
                          borderColor: `${p.categoryColor || "#f97316"}40`,
                        }}
                        className="text-xs font-bold"
                      >
                        {p.categoryName || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-foreground">₹{p.price.toFixed(2)}</td>
                    <td className="p-3 text-xs text-muted-foreground">{p.unitOfMeasure}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                      {p.description || "-"}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? "Edit Product" : "Create New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Product Name *</label>
              <Input
                placeholder="e.g. Hazelnut Cold Coffee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground">Category *</label>
                <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* On-the-fly category creation trigger */}
              <div className="pt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <FolderPlus className="h-4 w-4 text-primary" /> New Category
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Price (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Unit of Measure *</label>
                <Select
                  value={unitOfMeasure}
                  onValueChange={(val) => setUnitOfMeasure(val as Product["unitOfMeasure"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIECE">Per Piece</SelectItem>
                    <SelectItem value="KG">Per KG</SelectItem>
                    <SelectItem value="GRAM">Per Gram</SelectItem>
                    <SelectItem value="LITRE">Per Litre</SelectItem>
                    <SelectItem value="ML">Per ML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea
                placeholder="Product ingredients, flavor notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full font-bold">
              {editingId ? "Save Changes" : "Create Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* On-the-fly Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Category on the fly</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInlineCreateCategory} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category Name *</label>
              <Input
                placeholder="e.g. Specialty Shakes"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category Color *</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="h-10 w-16 rounded border cursor-pointer bg-card"
                />
                <span className="text-xs font-mono font-bold">{newCatColor}</span>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save Category & Assign
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
