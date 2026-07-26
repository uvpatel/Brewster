"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CookingPot,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  CheckCheck,
} from "lucide-react";
import type { KitchenTicket } from "@/lib/pos/pos-types";

export default function KitchenPage() {
  const { kitchenTickets, updateKitchenTicketStatus, toggleKitchenItemCompleted } = usePOS();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<string>("ALL");

  const filteredTickets = kitchenTickets.filter((ticket) => {
    const matchesStage = filterStage === "ALL" || ticket.status === filterStage;
    const matchesSearch =
      !searchTerm ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.tableName && ticket.tableName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ticket.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  const ticketsToCook = filteredTickets.filter((t) => t.status === "TO_COOK");
  const ticketsPreparing = filteredTickets.filter((t) => t.status === "PREPARING");
  const ticketsCompleted = filteredTickets.filter((t) => t.status === "COMPLETED");

  const renderTicketCard = (ticket: KitchenTicket) => {
    const isToCook = ticket.status === "TO_COOK";
    const isPreparing = ticket.status === "PREPARING";
    const isCompleted = ticket.status === "COMPLETED";

    const elapsedTimeMinutes = Math.floor(
      (Date.now() - new Date(ticket.sentAt).getTime()) / 60000,
    );

    return (
      <div
        key={ticket.id}
        className={`flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm transition-all ${
          isToCook
            ? "border-amber-500/50 bg-amber-500/5"
            : isPreparing
            ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/30"
            : "border-emerald-500/50 bg-emerald-500/5 opacity-80"
        }`}
      >
        {/* Ticket Card Header */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b">
            <div>
              <span className="text-base font-bold text-foreground">{ticket.ticketNumber}</span>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {ticket.tableName || "Takeaway"}
              </p>
            </div>

            <div className="text-right">
              <Badge
                variant={isToCook ? "secondary" : isPreparing ? "default" : "outline"}
                className="text-[10px] uppercase font-bold"
              >
                {ticket.status.replace("_", " ")}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                {elapsedTimeMinutes}m ago
              </p>
            </div>
          </div>

          {/* Ticket Items List with strikethrough feature */}
          <div className="py-3 space-y-2">
            {ticket.items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleKitchenItemCompleted(ticket.id, item.id)}
                className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all ${
                  item.isCompleted
                    ? "bg-muted/80 line-through text-muted-foreground border-transparent"
                    : "bg-background font-semibold hover:border-primary"
                }`}
              >
                <span className={item.isCompleted ? "line-through" : ""}>
                  {item.productName}
                </span>
                <span className="font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px]">
                  x{item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Stage Transition Actions */}
        <div className="pt-2 border-t flex justify-end gap-2">
          {isToCook && (
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              onClick={() => updateKitchenTicketStatus(ticket.id, "PREPARING")}
            >
              <Flame className="h-4 w-4 mr-1" /> Start Cooking
            </Button>
          )}

          {isPreparing && (
            <Button
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              onClick={() => updateKitchenTicketStatus(ticket.id, "COMPLETED")}
            >
              <CheckCheck className="h-4 w-4 mr-1" /> Mark Order Completed
            </Button>
          )}

          {isCompleted && (
            <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Ready to Serve
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Top KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CookingPot className="h-7 w-7 text-orange-500" />
            Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time kitchen order preparation and item tracking display
          </p>
        </div>

        {/* Stage & Search Filters */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter ticket or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMN 1: TO COOK */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-amber-500/10 p-3 border border-amber-500/30">
            <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              TO COOK ({ticketsToCook.length})
            </h3>
          </div>
          <div className="space-y-4">
            {ticketsToCook.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">No tickets waiting to cook</p>
            ) : (
              ticketsToCook.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-blue-500/10 p-3 border border-blue-500/30">
            <h3 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              PREPARING ({ticketsPreparing.length})
            </h3>
          </div>
          <div className="space-y-4">
            {ticketsPreparing.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">No tickets currently preparing</p>
            ) : (
              ticketsPreparing.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/30">
            <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCheck className="h-4 w-4" />
              COMPLETED ({ticketsCompleted.length})
            </h3>
          </div>
          <div className="space-y-4">
            {ticketsCompleted.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">No completed tickets</p>
            ) : (
              ticketsCompleted.map(renderTicketCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
