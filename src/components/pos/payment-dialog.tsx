"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Banknote, QrCode, CheckCircle2 } from "lucide-react";
import type { Order } from "@/lib/pos/pos-types";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: (order: Order) => void;
}

export function PaymentDialog({ open, onOpenChange, onPaymentSuccess }: PaymentDialogProps) {
  const { paymentMethods, payableTotal, processPayment } = usePOS();

  const enabledMethods = paymentMethods.filter((pm) => pm.isEnabled);
  const upiConfig = paymentMethods.find((pm) => pm.type === "UPI");

  const [activeTab, setActiveTab] = useState<string>(enabledMethods[0]?.type || "CASH");
  const [cashReceived, setCashReceived] = useState<string>(payableTotal.toString());
  const [cardRef, setCardRef] = useState<string>("");

  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashReceivedNum - payableTotal);

  const handleCompleteCash = () => {
    if (cashReceivedNum < payableTotal) return;
    const order = processPayment("CASH", cashReceivedNum);
    onPaymentSuccess(order);
    onOpenChange(false);
  };

  const handleCompleteCard = () => {
    const order = processPayment("CARD", payableTotal, cardRef);
    onPaymentSuccess(order);
    onOpenChange(false);
  };

  const handleCompleteUPI = () => {
    const order = processPayment("UPI", payableTotal);
    onPaymentSuccess(order);
    onOpenChange(false);
  };

  // Generate UPI QR Code URL
  const upiId = upiConfig?.upiId || "cafe@ybl";
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=CaffineCafe&am=${payableTotal}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-bold">
            <span>Process Payment</span>
            <span className="text-2xl font-bold text-primary">₹{payableTotal.toFixed(2)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {enabledMethods.length === 0 ? (
            <p className="text-center text-sm text-destructive py-4">
              No payment methods are enabled in the backend. Please enable Cash, Card, or UPI in Payment Method Setup.
            </p>
          ) : (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {enabledMethods.map((pm) => (
                  <TabsTrigger key={pm.id} value={pm.type} className="flex items-center gap-1.5 text-xs font-semibold">
                    {pm.type === "CASH" && <Banknote className="h-4 w-4" />}
                    {pm.type === "CARD" && <CreditCard className="h-4 w-4" />}
                    {pm.type === "UPI" && <QrCode className="h-4 w-4" />}
                    {pm.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* CASH TAB */}
              <TabsContent value="CASH" className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Amount Received (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>

                <div className="rounded-lg bg-muted p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Payable Total:</span>
                    <span className="font-bold">₹{payableTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cash Received:</span>
                    <span>₹{cashReceivedNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t">
                    <span>Change Due:</span>
                    <span>₹{changeDue.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-11 text-base font-bold"
                  disabled={cashReceivedNum < payableTotal}
                  onClick={handleCompleteCash}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Complete Cash Transaction
                </Button>
              </TabsContent>

              {/* CARD TAB */}
              <TabsContent value="CARD" className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Transaction Reference / Auth Code</label>
                  <Input
                    placeholder="e.g. TXN-98765432"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                  />
                </div>

                <div className="rounded-lg bg-muted p-3 flex justify-between text-sm">
                  <span>Amount to Charge Card:</span>
                  <span className="font-bold text-base text-primary">₹{payableTotal.toFixed(2)}</span>
                </div>

                <Button className="w-full h-11 text-base font-bold" onClick={handleCompleteCard}>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Confirm Card Payment
                </Button>
              </TabsContent>

              {/* UPI QR TAB */}
              <TabsContent value="UPI" className="space-y-4 text-center">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-white text-black shadow-sm">
                  {/* Dynamic QR Code */}
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-48 h-48 rounded-md border p-1"
                  />
                  <p className="mt-2 text-xs font-semibold text-gray-700">Scan with GPay / PhonePe / Paytm</p>
                  <p className="text-xs text-gray-500 font-mono">UPI ID: {upiId}</p>
                </div>

                <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-muted text-sm">
                  <span>Payable Amount:</span>
                  <span className="font-bold text-lg text-primary">₹{payableTotal.toFixed(2)}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCompleteUPI}>
                    <CheckCircle2 className="h-5 w-5 mr-1" />
                    Payment Confirmed
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
