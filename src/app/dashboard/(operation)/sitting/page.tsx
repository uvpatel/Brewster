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
import { RockingChair, Plus, Layers, Users } from "lucide-react";
import type { Table } from "@/lib/pos/pos-types";

export default function FloorTablePage() {
  const { floors, tables, addFloor, addTable, updateTableStatus } = usePOS();

  // Floor Modal State
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");

  // Table Modal State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [floorId, setFloorId] = useState(floors[0]?.id || "");
  const [seatingCapacity, setSeatingCapacity] = useState("4");

  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim()) return;
    addFloor(newFloorName);
    setNewFloorName("");
    setIsFloorModalOpen(false);
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim() || !floorId) return;

    const floor = floors.find((f) => f.id === floorId);

    addTable({
      floorId,
      floorName: floor?.name,
      tableNumber,
      seatingCapacity: parseInt(seatingCapacity, 10) || 4,
      status: "AVAILABLE",
    });

    setTableNumber("");
    setIsTableModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RockingChair className="h-7 w-7 text-amber-500" />
            Floor Plan & Table Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure restaurant floors, add seating tables, and manage active status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsFloorModalOpen(true)} className="font-bold">
            <Layers className="h-4 w-4 mr-1 text-primary" /> Add Floor
          </Button>

          <Button onClick={() => setIsTableModalOpen(true)} className="font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add Table
          </Button>
        </div>
      </div>

      {/* Floors & Tables Section */}
      <div className="space-y-6">
        {floors.map((floor) => {
          const floorTables = tables.filter((t) => t.floorId === floor.id);

          return (
            <div key={floor.id} className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  {floor.name}
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  {floorTables.length} Tables
                </span>
              </div>

              {floorTables.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No tables in this floor.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {floorTables.map((tbl) => (
                    <div
                      key={tbl.id}
                      className="flex flex-col justify-between rounded-lg border bg-background p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{tbl.tableNumber}</span>
                        <Badge
                          variant={tbl.status === "OCCUPIED" ? "destructive" : "outline"}
                          className="text-[10px]"
                        >
                          {tbl.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-muted-foreground pt-1 border-t">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {tbl.seatingCapacity} Seats
                        </span>

                        <Select
                          value={tbl.status}
                          onValueChange={(val) => updateTableStatus(tbl.id, val as Table["status"])}
                        >
                          <SelectTrigger className="h-6 text-[10px] w-20 px-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="OCCUPIED">Occupied</SelectItem>
                            <SelectItem value="RESERVED">Reserved</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Floor Modal */}
      <Dialog open={isFloorModalOpen} onOpenChange={setIsFloorModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Floor</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateFloor} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Floor Name *</label>
              <Input
                placeholder="e.g. Terrace Garden"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full font-bold">
              Save Floor
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Table Modal */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Table to Floor</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTable} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Select Floor *</label>
              <Select value={floorId} onValueChange={(val) => setFloorId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Table Number / Code *</label>
              <Input
                placeholder="e.g. T-09 or G-05"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Number of Seats *</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full font-bold">
              Create Table
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
