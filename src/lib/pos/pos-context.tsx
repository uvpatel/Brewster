"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  Category,
  Product,
  Floor,
  Table,
  Customer,
  CartItem,
  Coupon,
  Promotion,
  PaymentMethodConfig,
  Order,
  KitchenTicket,
} from "./pos-types";
import {
  initialCategories,
  initialProducts,
  initialFloors,
  initialTables,
  initialCustomers,
  initialCoupons,
  initialPromotions,
  initialPaymentMethods,
  initialOrders,
  initialKitchenTickets,
} from "./mock-data";

interface POSContextType {
  categories: Category[];
  products: Product[];
  floors: Floor[];
  tables: Table[];
  customers: Customer[];
  coupons: Coupon[];
  promotions: Promotion[];
  paymentMethods: PaymentMethodConfig[];
  orders: Order[];
  kitchenTickets: KitchenTicket[];

  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;

  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;

  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Calculated Order Totals
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  payableTotal: number;

  // Actions
  addCategory: (category: Omit<Category, "id">) => Category;
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addFloor: (name: string) => Floor;
  addTable: (table: Omit<Table, "id">) => Table;
  updateTableStatus: (tableId: string, status: Table["status"]) => void;

  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  togglePaymentMethod: (id: string) => void;
  updateUpiId: (upiId: string) => void;

  addCoupon: (coupon: Omit<Coupon, "id">) => Coupon;
  addPromotion: (promotion: Omit<Promotion, "id">) => Promotion;

  sendToKitchen: () => KitchenTicket | null;
  updateKitchenTicketStatus: (ticketId: string, status: KitchenTicket["status"]) => void;
  toggleKitchenItemCompleted: (ticketId: string, itemId: string) => void;

  processPayment: (method: PaymentMethodConfig["type"], paidAmount: number, ref?: string) => Order;

  editingOrderId: string | null;
  loadOrderForEdit: (orderId: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [floors, setFloors] = useState<Floor[]>(initialFloors);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(initialPaymentMethods);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(initialKitchenTickets);

  const [selectedTable, setSelectedTable] = useState<Table | null>(initialTables[0] || null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Cart operations
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) => {
          if (item.productId === product.id) {
            const newQty = item.quantity + 1;
            return {
              ...item,
              quantity: newQty,
              lineTotal: newQty * item.unitPrice,
            };
          }
          return item;
        });
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          categoryColor: product.categoryColor,
          unitPrice: product.price,
          quantity: 1,
          unitOfMeasure: product.unitOfMeasure,
          discountAmount: 0,
          lineTotal: product.price,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              lineTotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setEditingOrderId(null);
  };

  // Subtotal & Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST

  // Automated Promotions Calculation
  let automatedDiscount = 0;

  // 1. Product level promotions
  cartItems.forEach((item) => {
    const prodProm = promotions.find(
      (p) =>
        p.isActive &&
        p.scope === "PRODUCT" &&
        p.productId === item.productId &&
        item.quantity >= (p.minimumQuantity || 1),
    );
    if (prodProm) {
      if (prodProm.discountType === "PERCENTAGE") {
        automatedDiscount += (item.lineTotal * prodProm.discountValue) / 100;
      } else {
        automatedDiscount += prodProm.discountValue;
      }
    }
  });

  // 2. Order level promotions
  const orderProm = promotions.find(
    (p) => p.isActive && p.scope === "ORDER" && subtotal >= (p.minimumOrderAmount || 0),
  );
  if (orderProm) {
    if (orderProm.discountType === "PERCENTAGE") {
      automatedDiscount += (subtotal * orderProm.discountValue) / 100;
    } else {
      automatedDiscount += orderProm.discountValue;
    }
  }

  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      couponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  const discountAmount = Math.min(subtotal, automatedDiscount + couponDiscount);
  const payableTotal = Math.max(0, Math.round((subtotal + taxAmount - discountAmount) * 100) / 100);

  const applyCoupon = (code: string) => {
    const found = coupons.find(
      (c) => c.isActive && c.code.trim().toUpperCase() === code.trim().toUpperCase(),
    );
    if (!found) {
      return { success: false, message: "Invalid or inactive coupon code." };
    }
    if (found.minimumOrderAmount && subtotal < found.minimumOrderAmount) {
      return {
        success: false,
        message: `Minimum order amount for this coupon is ₹${found.minimumOrderAmount}`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon '${found.code}' applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Category & Product actions
  const addCategory = (category: Omit<Category, "id">): Category => {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const addProduct = (product: Omit<Product, "id">): Product => {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProd]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Floor & Table actions
  const addFloor = (name: string): Floor => {
    const newFloor: Floor = {
      id: `floor-${Date.now()}`,
      name,
      sequence: floors.length + 1,
    };
    setFloors((prev) => [...prev, newFloor]);
    return newFloor;
  };

  const addTable = (table: Omit<Table, "id">): Table => {
    const newTbl: Table = {
      ...table,
      id: `tbl-${Date.now()}`,
    };
    setTables((prev) => [...prev, newTbl]);
    return newTbl;
  };

  const updateTableStatus = (tableId: string, status: Table["status"]) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t)),
    );
    if (selectedTable?.id === tableId) {
      setSelectedTable((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Customer actions
  const addCustomer = (customer: Omit<Customer, "id">): Customer => {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Payment method toggles
  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, isEnabled: !pm.isEnabled } : pm)),
    );
  };

  const updateUpiId = (upiId: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.type === "UPI" ? { ...pm, upiId } : pm)),
    );
  };

  // Coupon & Promotion actions
  const addCoupon = (coupon: Omit<Coupon, "id">): Coupon => {
    const newCoup: Coupon = {
      ...coupon,
      id: `coup-${Date.now()}`,
    };
    setCoupons((prev) => [...prev, newCoup]);
    return newCoup;
  };

  const addPromotion = (promotion: Omit<Promotion, "id">): Promotion => {
    const newProm: Promotion = {
      ...promotion,
      id: `prom-${Date.now()}`,
    };
    setPromotions((prev) => [...prev, newProm]);
    return newProm;
  };

  // Send to Kitchen
  const sendToKitchen = (): KitchenTicket | null => {
    if (cartItems.length === 0) return null;

    const orderNum = `ORD-${1000 + orders.length + 1}`;
    const newTicket: KitchenTicket = {
      id: `kt-${Date.now()}`,
      ticketNumber: orderNum,
      orderId: `ord-${Date.now()}`,
      tableName: selectedTable ? `${selectedTable.tableNumber} (${selectedTable.floorName})` : "Takeaway",
      status: "TO_COOK",
      sentAt: new Date().toISOString(),
      items: cartItems.map((ci, idx) => ({
        id: `kti-${Date.now()}-${idx}`,
        productId: ci.productId,
        productName: ci.productName,
        quantity: ci.quantity,
        isCompleted: false,
      })),
    };

    setKitchenTickets((prev) => [newTicket, ...prev]);

    // Also update table status to OCCUPIED
    if (selectedTable) {
      updateTableStatus(selectedTable.id, "OCCUPIED");
    }

    return newTicket;
  };

  const updateKitchenTicketStatus = (ticketId: string, status: KitchenTicket["status"]) => {
    setKitchenTickets((prev) =>
      prev.map((kt) => (kt.id === ticketId ? { ...kt, status } : kt)),
    );
  };

  const toggleKitchenItemCompleted = (ticketId: string, itemId: string) => {
    setKitchenTickets((prev) =>
      prev.map((kt) => {
        if (kt.id === ticketId) {
          const updatedItems = kt.items.map((item) =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
          );
          const allDone = updatedItems.every((i) => i.isCompleted);
          return {
            ...kt,
            items: updatedItems,
            status: allDone ? "COMPLETED" : kt.status === "TO_COOK" ? "PREPARING" : kt.status,
          };
        }
        return kt;
      }),
    );
  };

  // Process Payment
  const processPayment = (
    method: PaymentMethodConfig["type"],
    paidAmount: number,
    ref?: string,
  ): Order => {
    const orderNum = editingOrderId
      ? orders.find((o) => o.id === editingOrderId)?.orderNumber || `ORD-${1000 + orders.length + 1}`
      : `ORD-${1000 + orders.length + 1}`;

    const newOrder: Order = {
      id: editingOrderId || `ord-${Date.now()}`,
      orderNumber: orderNum,
      tableId: selectedTable?.id,
      tableName: selectedTable ? `${selectedTable.tableNumber} (${selectedTable.floorName})` : "Takeaway",
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || "Walk-in Guest",
      customerEmail: selectedCustomer?.email,
      type: selectedTable ? "DINE_IN" : "TAKEAWAY",
      status: "PAID",
      subtotalAmount: subtotal,
      taxAmount,
      discountAmount,
      payableAmount: payableTotal,
      paidAmount,
      items: [...cartItems],
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === newOrder.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newOrder;
        return copy;
      }
      return [newOrder, ...prev];
    });

    if (selectedTable) {
      updateTableStatus(selectedTable.id, "AVAILABLE");
    }

    clearCart();
    return newOrder;
  };

  // Edit draft order
  const loadOrderForEdit = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setEditingOrderId(order.id);
    setCartItems(order.items);
    if (order.tableId) {
      const tbl = tables.find((t) => t.id === order.tableId);
      if (tbl) setSelectedTable(tbl);
    }
    if (order.customerId) {
      const cust = customers.find((c) => c.id === order.customerId);
      if (cust) setSelectedCustomer(cust);
    }
  };

  return (
    <POSContext.Provider
      value={{
        categories,
        products,
        floors,
        tables,
        customers,
        coupons,
        promotions,
        paymentMethods,
        orders,
        kitchenTickets,
        selectedTable,
        setSelectedTable,
        selectedCustomer,
        setSelectedCustomer,
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        taxAmount,
        discountAmount,
        payableTotal,
        addCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addFloor,
        addTable,
        updateTableStatus,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        togglePaymentMethod,
        updateUpiId,
        addCoupon,
        addPromotion,
        sendToKitchen,
        updateKitchenTicketStatus,
        toggleKitchenItemCompleted,
        processPayment,
        editingOrderId,
        loadOrderForEdit,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
