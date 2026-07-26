"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Disc, Ticket, Sparkles, Plus } from "lucide-react";
import type { Coupon, Promotion } from "@/lib/pos/pos-types";

export default function DiscountsPromotionsPage() {
  const { coupons, promotions, products, addCoupon, addPromotion } = usePOS();

  // Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<Coupon["discountType"]>("PERCENTAGE");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinAmount, setCouponMinAmount] = useState("");

  // Promotion Modal
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promName, setPromName] = useState("");
  const [promScope, setPromScope] = useState<Promotion["scope"]>("PRODUCT");
  const [promProductId, setPromProductId] = useState(products[0]?.id || "");
  const [promMinQty, setPromMinQty] = useState("2");
  const [promMinAmount, setPromMinAmount] = useState("500");
  const [promType, setPromType] = useState<Promotion["discountType"]>("PERCENTAGE");
  const [promValue, setPromValue] = useState("");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponValue) return;

    addCoupon({
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: parseFloat(couponValue) || 0,
      minimumOrderAmount: couponMinAmount ? parseFloat(couponMinAmount) : undefined,
      isActive: true,
    });

    setCouponCode("");
    setCouponValue("");
    setCouponMinAmount("");
    setIsCouponModalOpen(false);
  };

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promName.trim() || !promValue) return;

    addPromotion({
      name: promName,
      scope: promScope,
      productId: promScope === "PRODUCT" ? promProductId : undefined,
      minimumQuantity: promScope === "PRODUCT" ? parseInt(promMinQty, 10) || 1 : undefined,
      minimumOrderAmount: promScope === "ORDER" ? parseFloat(promMinAmount) || 0 : undefined,
      discountType: promType,
      discountValue: parseFloat(promValue) || 0,
      isActive: true,
    });

    setPromName("");
    setPromValue("");
    setIsPromotionModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Disc className="h-7 w-7 text-pink-600" />
            Coupons & Automated Promotions
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure redeemable coupon codes and automated cart/product discount rules
          </p>
        </div>
      </div>

      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="coupons" className="font-bold gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Coupon Codes
          </TabsTrigger>
          <TabsTrigger value="promotions" className="font-bold gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Automated Promotions
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COUPONS */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Code-based discounts entered manually by cashiers at POS checkout.</p>
            <Button onClick={() => setIsCouponModalOpen(true)} className="font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add Coupon Code
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="rounded-xl border bg-card p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-foreground font-mono">{c.code}</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active</Badge>
                </div>
                <p className="text-sm font-bold text-primary">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF Total` : `₹${c.discountValue} OFF Flat`}
                </p>
                {c.minimumOrderAmount && (
                  <p className="text-xs text-muted-foreground">Min Order Amount: ₹{c.minimumOrderAmount}</p>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: AUTOMATED PROMOTIONS */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Automatic discount rules triggered when minimum quantities or order totals are met.</p>
            <Button onClick={() => setIsPromotionModalOpen(true)} className="font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add Promotion Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((p) => (
              <div key={p.id} className="rounded-xl border bg-card p-4 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                  <Badge variant="secondary" className="text-xs font-bold">{p.scope} PROMO</Badge>
                </div>

                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {p.discountType === "PERCENTAGE" ? `${p.discountValue}% Discount` : `₹${p.discountValue} Discount`}
                </p>

                <p className="text-xs text-muted-foreground">
                  Trigger condition: {p.scope === "PRODUCT" ? `Buy Min ${p.minimumQuantity || 1} units of product` : `Order total crosses ₹${p.minimumOrderAmount}`}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Coupon Modal */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Coupon Code</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Coupon Code *</label>
              <Input
                placeholder="e.g. SUMMER50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="uppercase font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Discount Type *</label>
                <Select value={couponType} onValueChange={(val) => setCouponType(val as Coupon["discountType"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Discount Value *</label>
                <Input
                  type="number"
                  placeholder={couponType === "PERCENTAGE" ? "15" : "50"}
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Minimum Order Amount (Optional ₹)</label>
              <Input
                type="number"
                placeholder="300"
                value={couponMinAmount}
                onChange={(e) => setCouponMinAmount(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full font-bold">
              Create Coupon
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Promotion Modal */}
      <Dialog open={isPromotionModalOpen} onOpenChange={setIsPromotionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Automated Promotion</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePromotion} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Promotion Name *</label>
              <Input
                placeholder="e.g. Buy 2 Cappuccino Get 20% Off"
                value={promName}
                onChange={(e) => setPromName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Promotion Scope *</label>
              <Select value={promScope} onValueChange={(val) => setPromScope(val as Promotion["scope"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Product Level (Min Quantity)</SelectItem>
                  <SelectItem value="ORDER">Order Level (Min Cart Total)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {promScope === "PRODUCT" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Target Product *</label>
                  <Select value={promProductId} onValueChange={(val) => setPromProductId(val || "")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Min Quantity *</label>
                  <Input
                    type="number"
                    value={promMinQty}
                    onChange={(e) => setPromMinQty(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Min Order Amount (₹) *</label>
                <Input
                  type="number"
                  value={promMinAmount}
                  onChange={(e) => setPromMinAmount(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Discount Type *</label>
                <Select value={promType} onValueChange={(val) => setPromType(val as Promotion["discountType"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Discount Value *</label>
                <Input
                  type="number"
                  value={promValue}
                  onChange={(e) => setPromValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-bold">
              Create Automated Rule
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
