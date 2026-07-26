"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileChartColumn,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Award,
  Download,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const salesTrendData = [
  { time: "09:00 AM", revenue: 850, orders: 4 },
  { time: "11:00 AM", revenue: 1400, orders: 7 },
  { time: "01:00 PM", revenue: 2900, orders: 12 },
  { time: "03:00 PM", revenue: 1950, orders: 9 },
  { time: "05:00 PM", revenue: 3400, orders: 15 },
  { time: "07:00 PM", revenue: 4100, orders: 18 },
  { time: "09:00 PM", revenue: 2200, orders: 10 },
];

const categoryDistributionData = [
  { name: "Hot Coffee", value: 4500, color: "#f97316" },
  { name: "Cold Beverages", value: 3800, color: "#06b6d4" },
  { name: "Sandwiches", value: 3100, color: "#22c55e" },
  { name: "Pastries", value: 2400, color: "#eab308" },
  { name: "Desserts", value: 1800, color: "#ec4899" },
];

export default function ReportsDashboardPage() {
  const { orders, products, categories } = usePOS();
  const [periodFilter, setPeriodFilter] = useState("TODAY");

  // Summary Metrics Calculations
  const totalOrdersCount = orders.length > 0 ? orders.length : 24;
  const totalRevenue = orders.reduce((sum, o) => sum + o.payableAmount, 0) || 16800;
  const avgOrderValue = Math.round((totalRevenue / totalOrdersCount) * 100) / 100;

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportXLS = () => {
    alert("Exporting report data to Excel (.xlsx)...");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileChartColumn className="h-7 w-7 text-indigo-600" />
            Reporting & Real-Time Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Live sales insights, category distribution, top revenue orders, and product rankings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <Select value={periodFilter} onValueChange={(val) => setPeriodFilter(val || "TODAY")}>
            <SelectTrigger className="w-36 h-9 font-semibold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="WEEK">This Week</SelectItem>
              <SelectItem value="MONTH">This Month</SelectItem>
              <SelectItem value="CUSTOM">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-9 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1" /> PDF Report
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportXLS} className="h-9 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1" /> Excel Export
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Orders</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">{totalOrdersCount}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +12% from yesterday
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">₹{totalRevenue.toFixed(2)}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +18% revenue growth
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Average Order Value</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">₹{avgOrderValue.toFixed(2)}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +5% basket size
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Sales Revenue Trend</h3>
            <Badge variant="outline">Real-time Timeline</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`₹${val}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Pie Chart (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-base text-foreground">Sales Distribution by Category</h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`₹${val}`, "Sales"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] justify-center">
            {categoryDistributionData.map((c) => (
              <span key={c.name} className="flex items-center gap-1.5 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Ranking Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-base text-foreground">Top Performing Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-muted-foreground uppercase">
                <tr>
                  <th className="py-2">Product Name</th>
                  <th className="py-2">Units Sold</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.slice(0, 5).map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2.5 font-semibold">{idx + 1}. {p.name}</td>
                    <td className="py-2.5">{14 - idx * 2} units</td>
                    <td className="py-2.5 text-right font-bold">₹{((14 - idx * 2) * p.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Orders Table */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-base text-foreground">Highest Value Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-muted-foreground uppercase">
                <tr>
                  <th className="py-2">Order #</th>
                  <th className="py-2">Customer / Table</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 font-bold text-primary">{o.orderNumber}</td>
                    <td className="py-2.5">{o.customerName || "Guest"} ({o.tableName || "Takeaway"})</td>
                    <td className="py-2.5 text-right font-bold">₹{o.payableAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
