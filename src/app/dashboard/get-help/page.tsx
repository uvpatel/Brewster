"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  CircleHelp,
  ShoppingBag,
  CookingPot,
  CreditCard,
  Keyboard,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  BookOpen,
} from "lucide-react";

export default function GetHelpPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject("");
      setMessage("");
    }, 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CircleHelp className="h-7 w-7 text-primary" />
          Help & Support Center
        </h1>
        <p className="text-xs text-muted-foreground">
          Caffine Cafe POS system user manual, keyboard shortcuts, FAQ, and technical support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main User Manual & FAQ (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quickstart Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card p-4 shadow-xs space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">POS Terminal Guide</h3>
              <p className="text-xs text-muted-foreground">
                Learn how to pick tables, add products to cart, apply discounts, and complete checkout.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-xs space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                <CookingPot className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">KDS Kitchen Workflow</h3>
              <p className="text-xs text-muted-foreground">
                Understand how order tickets transition from To Cook to Preparing and Completed.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-xs space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm">Payment Methods</h3>
              <p className="text-xs text-muted-foreground">
                Cash change calculator, card auth codes, and dynamic UPI QR code generator.
              </p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Frequently Asked Questions (FAQ)
            </h3>

            <Accordion className="w-full text-xs">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold">How do I change roles for an employee?</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  Navigate to <strong>Employees</strong> in the sidebar, click <strong>Manage</strong> next to the employee record, select the desired role (ADMIN, MANAGER, CASHIER, KITCHEN), and click Save.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-semibold">How does automated promotion calculation work?</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  Automated promotions evaluate cart items in real time. Product-level promotions trigger when line quantities hit the minimum threshold, while order-level promotions trigger when subtotal crosses the minimum amount.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-semibold">How do I configure my merchant UPI QR Code?</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  Go to <strong>Payment Methods Setup</strong> in settings, enable the UPI QR method, enter your UPI Virtual Payment Address (e.g. <code>cafe@ybl</code>), and click Save. The POS payment screen will automatically render dynamic QR codes with exact payable amounts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-semibold">Can I edit an existing order after sending it to the kitchen?</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  Yes! Open the <strong>Orders</strong> page, find the order with status <strong>Draft</strong>, and click <strong>Edit Order</strong>. The order items will re-load into your POS cart for instant modifications.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* POS Keyboard Shortcuts */}
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-purple-600" /> POS Cashier Keyboard Shortcuts
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-muted">
                <span>Focus Product Search Bar</span>
                <Badge variant="outline" className="font-mono">F2 / /</Badge>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-muted">
                <span>Open Floor Selection Pop-up</span>
                <Badge variant="outline" className="font-mono">Alt + F</Badge>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-muted">
                <span>Open Coupon Discount Modal</span>
                <Badge variant="outline" className="font-mono">Alt + D</Badge>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-muted">
                <span>Proceed to Payment</span>
                <Badge variant="outline" className="font-mono">Ctrl + Enter</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Support Ticket Form & Contact Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-foreground">Contact Technical Support</h3>
            <p className="text-xs text-muted-foreground">Submit a query or request assistance from our POS support engineers.</p>

            <form onSubmit={handleSubmitSupportTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
                <Input
                  placeholder="e.g. Printer issue or login error"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description *</label>
                <Textarea
                  placeholder="Provide details about the issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full font-bold">
                <Send className="h-4 w-4 mr-1" /> Submit Ticket
              </Button>

              {submitted && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Support ticket submitted! Response will be sent to your email.
                </div>
              )}
            </form>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-foreground">Direct Support Helpline</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" /> +91 1800 123 4567 (24/7 Toll-Free)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> support@caffinecafe.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
