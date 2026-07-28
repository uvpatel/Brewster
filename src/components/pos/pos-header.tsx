"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingBag,
  Receipt,
  User,
  RockingChair,
  Search,
  Menu,
  Coffee,
  ShoppingBasket,
  CreditCard,
  Disc,
  CookingPot,
  FileChartColumn,
  Users,
  LogOut,
  Calendar,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface POSHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenFloorDialog: () => void;
  onOpenCustomerDialog: () => void;
}

export function POSHeader({
  searchTerm,
  onSearchChange,
  onOpenFloorDialog,
  onOpenCustomerDialog,
}: POSHeaderProps) {
  const router = useRouter();
  const { selectedTable, selectedCustomer } = usePOS();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
      {/* Left Navigation Actions */}
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="font-bold gap-1.5">
          <ShoppingBag className="h-4 w-4" />
          POS Order
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/orders")}
          className="gap-1.5"
        >
          <Receipt className="h-4 w-4" />
          Orders
        </Button>

        <Button
          variant={selectedCustomer ? "secondary" : "outline"}
          size="sm"
          onClick={onOpenCustomerDialog}
          className="gap-1.5"
        >
          <User className="h-4 w-4 text-primary" />
          <span className="max-w-[100px] truncate">
            {selectedCustomer ? selectedCustomer.name : "Customer"}
          </span>
        </Button>

        <Button
          variant={selectedTable ? "secondary" : "outline"}
          size="sm"
          onClick={onOpenFloorDialog}
          className="gap-1.5"
        >
          <RockingChair className="h-4 w-4 text-amber-500" />
          <span className="font-semibold">
            {selectedTable ? `${selectedTable.tableNumber}` : "Table View"}
          </span>
        </Button>
      </div>

      {/* Middle Product Search Bar */}
      <div className="relative flex-1 max-w-sm mx-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search product by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-background"
        />
      </div>

      {/* Right Controls & Hamburger Menu */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-semibold">
          <User className="h-3.5 w-3.5 text-primary" />
          <span>Cashier Session</span>
        </div>

        {/* Hamburger Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Cafe Management</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/dashboard/product")} className="cursor-pointer">
              <Coffee className="h-4 w-4 mr-2 text-amber-600" />
              Products
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/catagory")} className="cursor-pointer">
              <ShoppingBasket className="h-4 w-4 mr-2 text-cyan-600" />
              Categories
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/payment")} className="cursor-pointer">
              <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
              Payment Methods
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/discounts")} className="cursor-pointer">
              <Disc className="h-4 w-4 mr-2 text-pink-600" />
              Coupons & Promotions
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/sitting")} className="cursor-pointer">
              <Calendar className="h-4 w-4 mr-2 text-purple-600" />
              Bookings & Floors
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/employees")} className="cursor-pointer">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Employees
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/kitchen")} className="cursor-pointer">
              <CookingPot className="h-4 w-4 mr-2 text-orange-600" />
              Kitchen Display (KDS)
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/dashboard/reports")} className="cursor-pointer">
              <FileChartColumn className="h-4 w-4 mr-2 text-indigo-600" />
              Reports & Dashboard
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer focus:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
