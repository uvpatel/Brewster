"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Banknote, QrCode, Save } from "lucide-react";

export default function PaymentMethodsPage() {
  const { paymentMethods, togglePaymentMethod, updateUpiId } = usePOS();

  const upiMethod = paymentMethods.find((pm) => pm.type === "UPI");
  const [upiInput, setUpiInput] = useState(upiMethod?.upiId || "caffinecafe@ybl");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    updateUpiId(upiInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-emerald-600" />
          Payment Method Setup
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure enabled payment methods at checkout and manage UPI QR merchant ID
        </p>
      </div>

      {/* Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className={`flex flex-col justify-between rounded-xl border p-5 bg-card shadow-xs space-y-4 transition-all ${
              pm.isEnabled ? "border-emerald-500/50 bg-emerald-500/5" : "opacity-75"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {pm.type === "CASH" && <Banknote className="h-6 w-6" />}
                  {pm.type === "CARD" && <CreditCard className="h-6 w-6" />}
                  {pm.type === "UPI" && <QrCode className="h-6 w-6" />}
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground">{pm.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {pm.type === "CASH"
                      ? "Manual cash entry & change calculator"
                      : pm.type === "CARD"
                      ? "Debit/Credit card transaction reference"
                      : "Dynamic UPI QR code generator"}
                  </p>
                </div>
              </div>

              <Switch
                checked={pm.isEnabled}
                onCheckedChange={() => togglePaymentMethod(pm.id)}
              />
            </div>

            {/* Config section for UPI ID */}
            {pm.type === "UPI" && pm.isEnabled && (
              <form onSubmit={handleSaveUpi} className="pt-3 border-t space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Merchant UPI Virtual Payment Address (VPA)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. cafe@ybl"
                    value={upiInput}
                    onChange={(e) => setUpiInput(e.target.value)}
                    className="h-9 font-mono text-xs"
                    required
                  />
                  <Button type="submit" size="sm" className="h-9 font-bold">
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
                {savedSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Merchant UPI ID saved successfully!
                  </p>
                )}
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
