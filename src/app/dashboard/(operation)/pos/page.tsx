"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { POSHeader } from "@/components/pos/pos-header";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartSection } from "@/components/pos/cart-section";
import { FloorDialog } from "@/components/pos/floor-dialog";
import { CustomerDialog } from "@/components/pos/customer-dialog";
import { CouponDialog } from "@/components/pos/coupon-dialog";
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { ReceiptDialog } from "@/components/pos/receipt-dialog";
import type { Order } from "@/lib/pos/pos-types";

export default function POSPage() {
  const { sendToKitchen } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isFloorOpen, setIsFloorOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleSendToKitchen = async () => {
    const ticket = await sendToKitchen();
    if (ticket) {
      alert(`Order ${ticket.ticketNumber} sent to Kitchen Display System!`);
    }
  };

  const handlePaymentSuccess = (order: Order) => {
    setCompletedOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,3.5rem))] bg-background overflow-hidden">
      {/* Header */}
      <POSHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenFloorDialog={() => setIsFloorOpen(true)}
        onOpenCustomerDialog={() => setIsCustomerOpen(true)}
      />

      {/* Main Content split into Product Grid & Cart */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Side: Product Grid (7 cols) */}
        <div className="md:col-span-7 lg:col-span-8 overflow-hidden">
          <ProductGrid searchTerm={searchTerm} />
        </div>

        {/* Right Side: Cart Section (5 cols) */}
        <div className="md:col-span-5 lg:col-span-4 overflow-hidden">
          <CartSection
            onOpenCustomerDialog={() => setIsCustomerOpen(true)}
            onOpenCouponDialog={() => setIsCouponOpen(true)}
            onOpenPaymentDialog={() => setIsPaymentOpen(true)}
            onSendToKitchen={handleSendToKitchen}
          />
        </div>
      </div>

      {/* Modals */}
      <FloorDialog open={isFloorOpen} onOpenChange={setIsFloorOpen} />
      <CustomerDialog open={isCustomerOpen} onOpenChange={setIsCustomerOpen} />
      <CouponDialog open={isCouponOpen} onOpenChange={setIsCouponOpen} />
      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        order={completedOrder}
      />
    </div>
  );
}
