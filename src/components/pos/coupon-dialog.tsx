"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket, Percent, DollarSign, CheckCircle, Trash2 } from "lucide-react";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponDialog({ open, onOpenChange }: CouponDialogProps) {
  const { applyCoupon, appliedCoupon, removeCoupon, coupons } = usePOS();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    const result = applyCoupon(code);
    setFeedback(result);
    if (result.success) {
      setCode("");
      setTimeout(() => {
        onOpenChange(false);
        setFeedback(null);
      }, 1200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Ticket className="h-6 w-6 text-primary" />
            Apply Coupon Code
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {appliedCoupon.code}
                </span>
                <p className="text-xs text-muted-foreground">
                  {appliedCoupon.discountType === "PERCENTAGE"
                    ? `${appliedCoupon.discountValue}% OFF Total Order`
                    : `₹${appliedCoupon.discountValue} OFF Flat Discount`}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  removeCoupon();
                  setFeedback({ success: true, message: "Coupon removed." });
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <Input
                placeholder="Enter coupon code (e.g. WELCOME10)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="uppercase"
              />
              <Button type="submit">Apply</Button>
            </form>
          )}

          {feedback && (
            <p
              className={`text-sm font-medium ${
                feedback.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Available Coupons:</p>
            <div className="flex flex-wrap gap-2">
              {coupons
                .filter((c) => c.isActive)
                .map((c) => (
                  <Button
                    key={c.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setCode(c.code);
                      applyCoupon(c.code);
                    }}
                  >
                    {c.code} ({c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`})
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
