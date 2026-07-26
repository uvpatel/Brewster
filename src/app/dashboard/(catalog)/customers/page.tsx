"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone } from "lucide-react";
import type { Customer } from "@/lib/pos/pos-types";

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateCustomer(editingId, { name, email, phone });
    } else {
      addCustomer({ name, email, phone });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            Customer Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage cafe customer directory, contact details, and receipt delivery addresses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button onClick={handleOpenCreate} className="font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div key={c.id} className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs">
            <div>
              <h3 className="font-bold text-base text-foreground mb-2">{c.name}</h3>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> {c.email || "No email"}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" /> {c.phone || "No phone"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t mt-3">
              <Button variant="outline" size="sm" onClick={() => handleOpenEdit(c)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteCustomer(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <Input
                placeholder="e.g. Ananya Roy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="ananya@example.com"
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

            <Button type="submit" className="w-full font-bold">
              {editingId ? "Save Customer" : "Create Customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
