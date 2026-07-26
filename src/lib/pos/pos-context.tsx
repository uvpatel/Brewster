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
  isLoading: boolean;
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
  addCategory: (category: Omit<Category, "id">) => Promise<Category>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addFloor: (name: string) => Promise<Floor>;
  addTable: (table: Omit<Table, "id">) => Promise<Table>;
  updateTableStatus: (tableId: string, status: Table["status"]) => Promise<void>;

  addCustomer: (customer: Omit<Customer, "id">) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  togglePaymentMethod: (id: string) => Promise<void>;
  updateUpiId: (upiId: string) => Promise<void>;

  addCoupon: (coupon: Omit<Coupon, "id">) => Promise<Coupon>;
  addPromotion: (promotion: Omit<Promotion, "id">) => Promise<Promotion>;

  sendToKitchen: () => Promise<KitchenTicket | null>;
  updateKitchenTicketStatus: (ticketId: string, status: KitchenTicket["status"]) => Promise<void>;
  toggleKitchenItemCompleted: (ticketId: string, itemId: string) => void;

  processPayment: (method: PaymentMethodConfig["type"], paidAmount: number, ref?: string) => Promise<Order>;

  editingOrderId: string | null;
  loadOrderForEdit: (orderId: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Fetch initial real data from Neon PostgreSQL via API on mount
  useEffect(() => {
    async function loadPosData() {
      try {
        const res = await fetch("/api/pos/init");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            if (d.categories && d.categories.length > 0) setCategories(d.categories);
            if (d.products && d.products.length > 0) setProducts(d.products);
            if (d.floors && d.floors.length > 0) setFloors(d.floors);
            if (d.tables && d.tables.length > 0) {
              setTables(d.tables);
              setSelectedTable(d.tables[0] || null);
            }
            if (d.customers && d.customers.length > 0) setCustomers(d.customers);
            if (d.paymentMethods && d.paymentMethods.length > 0) setPaymentMethods(d.paymentMethods);
            if (d.coupons && d.coupons.length > 0) setCoupons(d.coupons);
            if (d.promotions && d.promotions.length > 0) setPromotions(d.promotions);
            if (d.orders && d.orders.length > 0) setOrders(d.orders);
            if (d.kitchenTickets && d.kitchenTickets.length > 0) setKitchenTickets(d.kitchenTickets);
          }
        }
      } catch (err) {
        console.error("Failed to load POS initialization data from Neon DB:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosData();
  }, []);

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

  // Category API actions
  const addCategory = async (category: Omit<Category, "id">): Promise<Category> => {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCategories((prev) => prev.map((c) => (c.id === newCat.id ? json.data : c)));
          return json.data;
        }
      }
    } catch (e) {
      console.error("Error creating category:", e);
    }
    return newCat;
  };

  // Product API actions
  const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
    const newProd: Product = { ...product, id: `prod-${Date.now()}` };
    setProducts((prev) => [...prev, newProd]);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const dbProd = { ...json.data, price: parseFloat(String(json.data.price)) };
          setProducts((prev) => prev.map((p) => (p.id === newProd.id ? dbProd : p)));
          return dbProd;
        }
      }
    } catch (e) {
      console.error("Error creating product:", e);
    }
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error("Error updating product:", e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Error deleting product:", e);
    }
  };

  // Floor & Table API actions
  const addFloor = async (name: string): Promise<Floor> => {
    const newFloor: Floor = { id: `floor-${Date.now()}`, name, sequence: floors.length + 1 };
    setFloors((prev) => [...prev, newFloor]);

    try {
      const res = await fetch("/api/floors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setFloors((prev) => prev.map((f) => (f.id === newFloor.id ? json.data : f)));
          return json.data;
        }
      }
    } catch (e) {
      console.error("Error creating floor:", e);
    }
    return newFloor;
  };

  const addTable = async (table: Omit<Table, "id">): Promise<Table> => {
    const newTbl: Table = { ...table, id: `tbl-${Date.now()}` };
    setTables((prev) => [...prev, newTbl]);

    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(table),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTables((prev) => prev.map((t) => (t.id === newTbl.id ? json.data : t)));
          return json.data;
        }
      }
    } catch (e) {
      console.error("Error creating table:", e);
    }
    return newTbl;
  };

  const updateTableStatus = async (tableId: string, status: Table["status"]) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
    if (selectedTable?.id === tableId) {
      setSelectedTable((prev) => (prev ? { ...prev, status } : null));
    }

    try {
      await fetch(`/api/tables/${tableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error("Error updating table status:", e);
    }
  };

  // Customer API actions
  const addCustomer = async (customer: Omit<Customer, "id">): Promise<Customer> => {
    const newCust: Customer = { ...customer, id: `cust-${Date.now()}` };
    setCustomers((prev) => [...prev, newCust]);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCustomers((prev) => prev.map((c) => (c.id === newCust.id ? json.data : c)));
          return json.data;
        }
      }
    } catch (e) {
      console.error("Error creating customer:", e);
    }
    return newCust;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error("Error updating customer:", e);
    }
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Error deleting customer:", e);
    }
  };

  // Payment method toggles & UPI VPA update
  const togglePaymentMethod = async (id: string) => {
    const target = paymentMethods.find((pm) => pm.id === id);
    if (!target) return;
    const newEnabled = !target.isEnabled;

    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, isEnabled: newEnabled } : pm)),
    );

    try {
      await fetch(`/api/payment-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: newEnabled }),
      });
    } catch (e) {
      console.error("Error updating payment method:", e);
    }
  };

  const updateUpiId = async (upiId: string) => {
    const target = paymentMethods.find((pm) => pm.type === "UPI");
    if (!target) return;

    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.type === "UPI" ? { ...pm, upiId } : pm)),
    );

    try {
      await fetch(`/api/payment-methods/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId }),
      });
    } catch (e) {
      console.error("Error updating UPI ID:", e);
    }
  };

  // Coupon & Promotion API actions
  const addCoupon = async (coupon: Omit<Coupon, "id">): Promise<Coupon> => {
    const newCoup: Coupon = { ...coupon, id: `coup-${Date.now()}` };
    setCoupons((prev) => [...prev, newCoup]);

    try {
      const res = await fetch("/api/discounts/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coupon),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const dbCoup = {
            ...json.data,
            discountValue: parseFloat(String(json.data.discountValue)),
          };
          setCoupons((prev) => prev.map((c) => (c.id === newCoup.id ? dbCoup : c)));
          return dbCoup;
        }
      }
    } catch (e) {
      console.error("Error creating coupon:", e);
    }
    return newCoup;
  };

  const addPromotion = async (promotion: Omit<Promotion, "id">): Promise<Promotion> => {
    const newProm: Promotion = { ...promotion, id: `prom-${Date.now()}` };
    setPromotions((prev) => [...prev, newProm]);

    try {
      const res = await fetch("/api/discounts/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promotion),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const dbProm = {
            ...json.data,
            discountValue: parseFloat(String(json.data.discountValue)),
          };
          setPromotions((prev) => prev.map((p) => (p.id === newProm.id ? dbProm : p)));
          return dbProm;
        }
      }
    } catch (e) {
      console.error("Error creating promotion:", e);
    }
    return newProm;
  };

  // Send to Kitchen
  const sendToKitchen = async (): Promise<KitchenTicket | null> => {
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

    if (selectedTable) {
      updateTableStatus(selectedTable.id, "OCCUPIED");
    }

    try {
      await fetch("/api/kitchen/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });
    } catch (e) {
      console.error("Error sending ticket to kitchen API:", e);
    }

    return newTicket;
  };

  const updateKitchenTicketStatus = async (
    ticketId: string,
    status: KitchenTicket["status"],
  ) => {
    setKitchenTickets((prev) =>
      prev.map((kt) => (kt.id === ticketId ? { ...kt, status } : kt)),
    );

    try {
      await fetch(`/api/kitchen/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error("Error updating kitchen ticket status:", e);
    }
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
  const processPayment = async (
    method: PaymentMethodConfig["type"],
    paidAmount: number,
    ref?: string,
  ): Promise<Order> => {
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

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.id) {
          setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? { ...o, id: json.data.id } : o)));
        }
      }
    } catch (e) {
      console.error("Error creating order via API:", e);
    }

    clearCart();
    return newOrder;
  };

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
        isLoading,
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
