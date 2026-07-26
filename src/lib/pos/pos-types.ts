export type AppRole = "ADMIN" | "MANAGER" | "CASHIER" | "KITCHEN";

export interface Category {
  id: string;
  name: string;
  color: string; // e.g. "#f97316" or "hsl(...)"
  status?: "ACTIVE" | "ARCHIVED";
}

export interface Product {
  id: string;
  storeId?: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  taxId?: string;
  name: string;
  description?: string;
  price: number;
  taxRate?: number; // e.g. 5 for 5%
  unitOfMeasure: "PIECE" | "KG" | "GRAM" | "LITRE" | "ML";
  status?: "ACTIVE" | "ARCHIVED";
}

export interface Floor {
  id: string;
  name: string;
  sequence?: number;
}

export interface Table {
  id: string;
  floorId: string;
  floorName?: string;
  tableNumber: string;
  seatingCapacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE";
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  categoryColor?: string;
  unitPrice: number;
  quantity: number;
  unitOfMeasure: string;
  discountAmount: number;
  lineTotal: number;
  appliedPromotionName?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minimumOrderAmount?: number;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  scope: "PRODUCT" | "ORDER";
  productId?: string;
  minimumQuantity?: number;
  minimumOrderAmount?: number;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isActive: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  type: "CASH" | "CARD" | "UPI";
  name: string;
  upiId?: string;
  isEnabled: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  employeeId?: string;
  employeeName?: string;
  type: "DINE_IN" | "TAKEAWAY";
  status: "DRAFT" | "SENT_TO_KITCHEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  payableAmount: number;
  paidAmount: number;
  items: CartItem[];
  createdAt: string;
}

export interface KitchenTicketItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  isCompleted: boolean;
}

export interface KitchenTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  tableName?: string;
  status: "TO_COOK" | "PREPARING" | "COMPLETED";
  sentAt: string;
  items: KitchenTicketItem[];
}

export interface POSSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingSales: number;
  totalOrders: number;
  status: "OPEN" | "CLOSED";
}
