"use client";

import React, { useState } from "react";
import { usePOS } from "@/lib/pos/pos-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, RockingChair, CheckCircle2, Clock } from "lucide-react";
import type { Table } from "@/lib/pos/pos-types";

interface FloorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableSelect?: (table: Table) => void;
}

export function FloorDialog({ open, onOpenChange, onTableSelect }: FloorDialogProps) {
  const { floors, tables, selectedTable, setSelectedTable } = usePOS();
  const [activeFloorId, setActiveFloorId] = useState<string>(floors[0]?.id || "");

  const currentFloorId = activeFloorId || floors[0]?.id || "";
  const floorTables = tables.filter((t) => t.floorId === currentFloorId);

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    if (onTableSelect) {
      onTableSelect(table);
    }
    onOpenChange(false);
  };

  const getStatusBadge = (status: Table["status"]) => {
    switch (status) {
      case "OCCUPIED":
        return <Badge variant="destructive" className="text-xs">Occupied</Badge>;
      case "RESERVED":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">Reserved</Badge>;
      default:
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">Available</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <RockingChair className="h-6 w-6 text-primary" />
            Floor Plan & Table Selection
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {floors.length > 0 && (
            <Tabs defaultValue={currentFloorId} onValueChange={setActiveFloorId} className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                {floors.map((floor) => (
                  <TabsTrigger key={floor.id} value={floor.id} className="text-sm font-semibold">
                    {floor.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {floorTables.map((table) => {
                  const isSelected = selectedTable?.id === table.id;
                  const isOccupied = table.status === "OCCUPIED";

                  return (
                    <div
                      key={table.id}
                      onClick={() => handleSelectTable(table)}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : isOccupied
                          ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-lg font-bold text-foreground">{table.tableNumber}</span>
                        {getStatusBadge(table.status)}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {table.seatingCapacity} Seats
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
