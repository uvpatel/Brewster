"use client";

import React from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Trash2,
  User,
  Ticket,
  CookingPot,
  CreditCard,
  ShoppingBag,
  RockingChair,
} from "lucide-react";

interface CartSectionProps {
  onOpenCustomerDialog: () => void;
  onOpenCouponDialog: () => void;
  onOpenPaymentDialog: () => void;
  onSendToKitchen: () => void;
}

export function CartSection({
  onOpenCustomerDialog,
  onOpenCouponDialog,
  onOpenPaymentDialog,
  onSendToKitchen,
}: CartSectionProps) {
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    selectedTable,
    selectedCustomer,
    appliedCoupon,
    subtotal,
    taxAmount,
    discountAmount,
    payableTotal,
    editingOrderId,
  } = usePOS();

  return (
    <div className="flex h-full flex-col justify-between border-l bg-card p-4 shadow-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base">Current Order</h3>
          {editingOrderId && (
            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
              Editing Order
            </Badge>
          )}
        </div>

        {cartItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart} className="h-7 text-xs text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Selected Table / Customer Pills */}
      <div className="flex items-center gap-2 py-2 text-xs">
        <span className="flex items-center gap-1 font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
          <RockingChair className="h-3.5 w-3.5 text-amber-500" />
          {selectedTable ? `${selectedTable.tableNumber} (${selectedTable.floorName})` : "Takeaway"}
        </span>

        <span
          onClick={onOpenCustomerDialog}
          className="flex items-center gap-1 font-semibold text-muted-foreground bg-muted hover:bg-accent px-2.5 py-1 rounded-md cursor-pointer transition-colors"
        >
          <User className="h-3.5 w-3.5 text-primary" />
          {selectedCustomer ? selectedCustomer.name : "Assign Guest"}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-1">
        {cartItems.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 text-muted/50 mb-2" />
            <p className="text-sm font-medium">Cart is empty</p>
            <p className="text-xs">Click products from the grid to add items.</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between rounded-lg border bg-background p-2.5 text-sm"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-foreground truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">₹{item.unitPrice} / {item.unitOfMeasure}</p>
              </div>

              {/* Quantity adjustment controls */}
              <div className="flex items-center gap-1.5 bg-muted rounded-md p-1">
                <button
                  onClick={() => updateCartQuantity(item.productId, -1)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-background hover:bg-accent text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>

                <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>

                <button
                  onClick={() => updateCartQuantity(item.productId, 1)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-background hover:bg-accent text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="text-right pl-3">
                <p className="font-bold text-foreground">₹{item.lineTotal.toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-[10px] text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary & Actions */}
      <div className="space-y-3 pt-3 border-t">
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (5% GST)</span>
            <span className="font-semibold text-foreground">₹{taxAmount.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Discounts Applied</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-foreground pt-1.5 border-t">
            <span>Total Payable</span>
            <span className="text-primary text-lg">₹{payableTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onOpenCouponDialog} className="text-xs font-semibold">
            <Ticket className="h-3.5 w-3.5 mr-1 text-primary" />
            {appliedCoupon ? `Coupon (${appliedCoupon.code})` : "Apply Discount"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onSendToKitchen}
            disabled={cartItems.length === 0}
            className="text-xs font-semibold"
          >
            <CookingPot className="h-3.5 w-3.5 mr-1 text-orange-500" />
            Send to Kitchen
          </Button>

          <Button
            className="col-span-2 h-11 text-base font-bold"
            disabled={cartItems.length === 0}
            onClick={onOpenPaymentDialog}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ₹{payableTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
