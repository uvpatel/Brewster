"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Settings2,
  Store,
  Receipt,
  Percent,
  Save,
  CheckCircle2,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Caffine Cafe Vadodara");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [email, setEmail] = useState("contact@caffinecafe.com");
  const [address, setAddress] = useState("123 Vadodara Main Road, Vadodara, Gujarat 390001");
  const [gstin, setGstin] = useState("24ABCDE1234F1Z5");
  const [taxRate, setTaxRate] = useState("5");
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [receiptPrefix, setReceiptPrefix] = useState("ORD");
  const [headerNote, setHeaderNote] = useState("Welcome to Caffine Cafe!");
  const [footerNote, setFooterNote] = useState("Thank you for visiting! Have a wonderful day!");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.name) setStoreName(json.data.name);
            if (json.data.phone) setPhone(json.data.phone);
            if (json.data.email) setEmail(json.data.email);
            if (json.data.address) setAddress(json.data.address);
            if (json.data.receiptPrefix) setReceiptPrefix(json.data.receiptPrefix);
          }
        }
      } catch (err) {
        console.error("Failed to load store settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName,
          email,
          phone,
          address,
          receiptPrefix,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-7 w-7 text-primary" />
            Admin System Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure store profile information, tax rules, receipt layout, and POS preferences
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4" /> Settings Saved!
          </span>
        )}
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mb-6">
          <TabsTrigger value="store" className="font-bold gap-2">
            <Store className="h-4 w-4 text-primary" /> Store Profile
          </TabsTrigger>
          <TabsTrigger value="taxes" className="font-bold gap-2">
            <Percent className="h-4 w-4 text-emerald-600" /> Tax Setup
          </TabsTrigger>
          <TabsTrigger value="receipt" className="font-bold gap-2">
            <Receipt className="h-4 w-4 text-amber-500" /> Receipt Customizer
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSaveSettings}>
          {/* TAB 1: STORE PROFILE */}
          <TabsContent value="store" className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4 max-w-2xl">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> Store Details
              </h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Store Name *</label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Address *</label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">GSTIN / Tax Identification Number</label>
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button type="submit" className="font-bold">
                <Save className="h-4 w-4 mr-1" /> Save Store Profile
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: TAX SETUP */}
          <TabsContent value="taxes" className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4 max-w-2xl">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Percent className="h-5 w-5 text-emerald-600" /> Tax & Service Charge Configuration
              </h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Default Tax Rate (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-48 font-bold text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">Standard GST rate applied to all POS items.</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div>
                  <p className="font-semibold text-sm">Tax Inclusive Pricing</p>
                  <p className="text-xs text-muted-foreground">Product menu prices already include GST taxes.</p>
                </div>
                <Switch
                  checked={taxInclusive}
                  onCheckedChange={setTaxInclusive}
                />
              </div>

              <Button type="submit" className="font-bold">
                <Save className="h-4 w-4 mr-1" /> Save Tax Settings
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: RECEIPT CUSTOMIZER */}
          <TabsContent value="receipt" className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4 max-w-2xl">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-500" /> Print Receipt Customization
              </h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Order / Receipt Number Prefix</label>
                <Input
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value)}
                  className="w-48 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Receipt Header Note</label>
                <Input
                  value={headerNote}
                  onChange={(e) => setHeaderNote(e.target.value)}
                  placeholder="e.g. Welcome to Caffine Cafe!"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Receipt Footer Note</label>
                <Textarea
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Thank you for visiting! Have a wonderful day!"
                />
              </div>

              <Button type="submit" className="font-bold">
                <Save className="h-4 w-4 mr-1" /> Save Receipt Customization
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
