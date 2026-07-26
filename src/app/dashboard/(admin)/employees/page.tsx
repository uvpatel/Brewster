"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Search, Edit2, ShieldAlert, CheckCircle2, Archive } from "lucide-react";
import type { AppRole } from "@/lib/auth/permissions";

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: "ACTIVE" | "ARCHIVED";
}

const mockEmployeesList: EmployeeItem[] = [
  { id: "emp-101", name: "Admin Owner", email: "admin@cafe.com", role: "ADMIN", status: "ACTIVE" },
  { id: "emp-102", name: "Manager Vikram", email: "vikram@cafe.com", role: "MANAGER", status: "ACTIVE" },
  { id: "emp-103", name: "Cashier Sneha", email: "sneha@cafe.com", role: "CASHIER", status: "ACTIVE" },
  { id: "emp-104", name: "Kitchen Chef Amit", email: "amit@cafe.com", role: "KITCHEN", status: "ACTIVE" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>(mockEmployeesList);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeItem | null>(null);
  const [roleInput, setRoleInput] = useState<AppRole>("CASHIER");
  const [statusInput, setStatusInput] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  // New Employee Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("CASHIER");

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenEdit = (emp: EmployeeItem) => {
    setSelectedEmp(emp);
    setRoleInput(emp.role);
    setStatusInput(emp.status);
    setIsModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === selectedEmp.id ? { ...emp, role: roleInput, status: statusInput } : emp,
      ),
    );

    setIsModalOpen(false);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      name,
      email,
      role: newRole,
      status: "ACTIVE",
    };

    setEmployees((prev) => [...prev, newEmp]);
    setName("");
    setEmail("");
    setIsCreateOpen(false);
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">ADMIN</Badge>;
      case "MANAGER":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">MANAGER</Badge>;
      case "CASHIER":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">CASHIER</Badge>;
      case "KITCHEN":
        return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">KITCHEN</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            User & Employee Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage employee accounts, assign system roles (Admin, Manager, Cashier, Kitchen), and archive accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button onClick={() => setIsCreateOpen(true)} className="font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add Account
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-3 font-bold">{emp.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{emp.email}</td>
                  <td className="p-3">{getRoleBadge(emp.role)}</td>
                  <td className="p-3">
                    <Badge variant={emp.status === "ACTIVE" ? "outline" : "secondary"}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(emp)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role & Status Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Manage {selectedEmp?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedEmp && (
            <form onSubmit={handleSaveRole} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Assigned Role *</label>
                <Select value={roleInput} onValueChange={(val) => setRoleInput(val as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN (Full Access)</SelectItem>
                    <SelectItem value="MANAGER">MANAGER (Operations & Employee Mgmt)</SelectItem>
                    <SelectItem value="CASHIER">CASHIER (POS & Orders)</SelectItem>
                    <SelectItem value="KITCHEN">KITCHEN (KDS Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Account Status *</label>
                <Select
                  value={statusInput}
                  onValueChange={(val) => setStatusInput(val as "ACTIVE" | "ARCHIVED")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="ARCHIVED">ARCHIVED (Deactivated)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full font-bold">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Employee Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Account</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <Input
                placeholder="e.g. Maya Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
              <Input
                type="email"
                placeholder="maya@cafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Role *</label>
              <Select value={newRole} onValueChange={(val) => setNewRole(val as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">CASHIER</SelectItem>
                  <SelectItem value="KITCHEN">KITCHEN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full font-bold">
              Create Account
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}