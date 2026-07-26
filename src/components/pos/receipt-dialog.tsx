"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Mail, CheckCircle2, Coffee } from "lucide-react";
import type { Order } from "@/lib/pos/pos-types";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function ReceiptDialog({ open, onOpenChange, order }: ReceiptDialogProps) {
  const [email, setEmail] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setEmail("");
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-bold">
            <span className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-primary" />
              Receipt
            </span>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Receipt Content */}
        <div id="receipt-print-area" className="rounded-lg border p-4 bg-card text-foreground text-sm space-y-3 font-mono">
          <div className="text-center pb-3 border-b">
            <h3 className="font-bold text-base uppercase tracking-wider">Caffine Cafe</h3>
            <p className="text-xs text-muted-foreground">123 Vadodara Main Road, Vadodara</p>
            <p className="text-xs text-muted-foreground">GSTIN: 24ABCDE1234F1Z5</p>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground border-b pb-2">
            <span>Order #: {order.orderNumber}</span>
            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="text-xs">
            <p>Table: {order.tableName || "Takeaway"}</p>
            <p>Customer: {order.customerName || "Guest"}</p>
          </div>

          <div className="space-y-1.5 border-t border-b py-2 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-muted-foreground">{item.quantity} x ₹{item.unitPrice}</p>
                </div>
                <span className="font-semibold">₹{item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST)</span>
              <span>₹{order.taxAmount.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-₹{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t text-foreground">
              <span>Total Paid</span>
              <span>₹{order.payableAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Email Delivery Section */}
        <form onSubmit={handleSendEmail} className="space-y-2 pt-2 border-t">
          <label className="text-xs font-semibold text-muted-foreground">Send Receipt via Email</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              defaultValue={order.customerEmail || ""}
            />
            <Button type="submit">
              <Mail className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
          {sentSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Receipt email sent successfully!
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
