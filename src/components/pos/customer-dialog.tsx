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
import { UserPlus, Search, UserCheck, Check } from "lucide-react";
import type { Customer } from "@/lib/pos/pos-types";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDialog({ open, onOpenChange }: CustomerDialogProps) {
  const { customers, selectedCustomer, setSelectedCustomer, addCustomer } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleSelect = (cust: Customer) => {
    setSelectedCustomer(cust);
    onOpenChange(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust = await addCustomer({
      name,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    setSelectedCustomer(newCust);
    setName("");
    setEmail("");
    setPhone("");
    setIsCreating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-bold">
            <span className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Select Customer
            </span>
            <Button
              variant={isCreating ? "secondary" : "default"}
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {isCreating ? "Back to List" : "New Customer"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isCreating ? (
          <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <Input
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Create & Assign Customer
            </Button>
          </form>
        ) : (
          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  No customers found. Click &quot;New Customer&quot; to add one.
                </p>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleSelect(cust)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{cust.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cust.phone || cust.email || "No contact details"}
                        </p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  );
                })
              )}
            </div>

            {selectedCustomer && (
              <div className="border-t pt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                  Clear Assigned Customer
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
