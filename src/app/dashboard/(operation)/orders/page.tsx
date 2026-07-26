"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/lib/pos/pos-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt, Search, Edit3, Eye, ShoppingBag } from "lucide-react";
import type { Order } from "@/lib/pos/pos-types";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loadOrderForEdit } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(term) ||
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.tableName && order.tableName.toLowerCase().includes(term))
    );
  });

  const handleEditOrder = (orderId: string) => {
    loadOrderForEdit(orderId);
    router.push("/dashboard/pos");
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Paid</Badge>;
      case "SENT_TO_KITCHEN":
      case "DRAFT":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-7 w-7 text-primary" />
            Session Orders
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage all session transactions, view receipts, and edit draft orders
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Table / Type</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isDraft = order.status === "DRAFT" || order.status === "SENT_TO_KITCHEN";

                  return (
                    <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-bold">{order.orderNumber}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="p-3 text-xs font-semibold">{order.tableName || "Takeaway"}</td>
                      <td className="p-3 text-xs">{order.customerName || "Guest"}</td>
                      <td className="p-3 font-bold text-foreground">₹{order.payableAmount.toFixed(2)}</td>
                      <td className="p-3">{getStatusBadge(order.status)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>

                          {isDraft && (
                            <Button
                              size="sm"
                              onClick={() => handleEditOrder(order.id)}
                              className="h-8 text-xs font-semibold"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Order
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between text-xl font-bold">
                  <span>{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs border-b pb-2 text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Table / Floor</p>
                    <p>{selectedOrder.tableName || "Takeaway"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Customer</p>
                    <p>{selectedOrder.customerName || "Guest"}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Ordered Products</p>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-muted text-xs">
                      <div>
                        <p className="font-bold">{item.productName}</p>
                        <p className="text-muted-foreground">{item.quantity} x ₹{item.unitPrice}</p>
                      </div>
                      <span className="font-bold text-sm">₹{item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5% GST)</span>
                    <span>₹{selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t text-foreground">
                    <span>Total Payable</span>
                    <span>₹{selectedOrder.payableAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
