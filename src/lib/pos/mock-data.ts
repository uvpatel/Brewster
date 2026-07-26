import type {
  Category,
  Product,
  Floor,
  Table,
  Customer,
  Coupon,
  Promotion,
  PaymentMethodConfig,
  Order,
  KitchenTicket,
} from "./pos-types";

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Hot Coffee", color: "#f97316", status: "ACTIVE" },
  { id: "cat-2", name: "Cold Beverages", color: "#06b6d4", status: "ACTIVE" },
  { id: "cat-3", name: "Pastries & Bakery", color: "#eab308", status: "ACTIVE" },
  { id: "cat-4", name: "Sandwiches & Snacks", color: "#22c55e", status: "ACTIVE" },
  { id: "cat-5", name: "Desserts", color: "#ec4899", status: "ACTIVE" },
];

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    categoryId: "cat-1",
    categoryName: "Hot Coffee",
    categoryColor: "#f97316",
    name: "Espresso Single",
    description: "Rich and bold dark roast single shot espresso",
    price: 120,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-2",
    categoryId: "cat-1",
    categoryName: "Hot Coffee",
    categoryColor: "#f97316",
    name: "Cappuccino",
    description: "Espresso topped with steamed milk and thick foam",
    price: 180,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-3",
    categoryId: "cat-1",
    categoryName: "Hot Coffee",
    categoryColor: "#f97316",
    name: "Caffè Latte",
    description: "Smooth espresso with generous velvety steamed milk",
    price: 190,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-4",
    categoryId: "cat-2",
    categoryName: "Cold Beverages",
    categoryColor: "#06b6d4",
    name: "Iced Caramel Macchiato",
    description: "Cold milk, espresso, and rich vanilla caramel drizzle",
    price: 220,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-5",
    categoryId: "cat-2",
    categoryName: "Cold Beverages",
    categoryColor: "#06b6d4",
    name: "Cold Brew Special",
    description: "Slow-steeped 18-hour cold brew over ice",
    price: 200,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-6",
    categoryId: "cat-3",
    categoryName: "Pastries & Bakery",
    categoryColor: "#eab308",
    name: "Butter Croissant",
    description: "Flaky layered French butter croissant",
    price: 140,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-7",
    categoryId: "cat-3",
    categoryName: "Pastries & Bakery",
    categoryColor: "#eab308",
    name: "Blueberry Muffin",
    description: "Freshly baked muffin bursting with real blueberries",
    price: 150,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-8",
    categoryId: "cat-4",
    categoryName: "Sandwiches & Snacks",
    categoryColor: "#22c55e",
    name: "Paneer Tikka Panini",
    description: "Grilled sourdough panini with spiced paneer tikka",
    price: 240,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-9",
    categoryId: "cat-4",
    categoryName: "Sandwiches & Snacks",
    categoryColor: "#22c55e",
    name: "Avocado Toast",
    description: "Artisanal bread with smashed avocado and chili flakes",
    price: 260,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
  {
    id: "prod-10",
    categoryId: "cat-5",
    categoryName: "Desserts",
    categoryColor: "#ec4899",
    name: "New York Cheesecake",
    description: "Classic creamy cheesecake with berry compote",
    price: 250,
    taxRate: 5,
    unitOfMeasure: "PIECE",
    status: "ACTIVE",
  },
];

export const initialFloors: Floor[] = [
  { id: "floor-1", name: "Main Hall", sequence: 1 },
  { id: "floor-2", name: "First Floor Balcony", sequence: 2 },
  { id: "floor-3", name: "Outdoor Garden", sequence: 3 },
];

export const initialTables: Table[] = [
  { id: "tbl-1", floorId: "floor-1", floorName: "Main Hall", tableNumber: "T-01", seatingCapacity: 2, status: "OCCUPIED" },
  { id: "tbl-2", floorId: "floor-1", floorName: "Main Hall", tableNumber: "T-02", seatingCapacity: 4, status: "AVAILABLE" },
  { id: "tbl-3", floorId: "floor-1", floorName: "Main Hall", tableNumber: "T-03", seatingCapacity: 4, status: "AVAILABLE" },
  { id: "tbl-4", floorId: "floor-1", floorName: "Main Hall", tableNumber: "T-04", seatingCapacity: 6, status: "RESERVED" },
  { id: "tbl-5", floorId: "floor-2", floorName: "First Floor Balcony", tableNumber: "B-01", seatingCapacity: 2, status: "AVAILABLE" },
  { id: "tbl-6", floorId: "floor-2", floorName: "First Floor Balcony", tableNumber: "B-02", seatingCapacity: 4, status: "OCCUPIED" },
  { id: "tbl-7", floorId: "floor-3", floorName: "Outdoor Garden", tableNumber: "G-01", seatingCapacity: 4, status: "AVAILABLE" },
  { id: "tbl-8", floorId: "floor-3", floorName: "Outdoor Garden", tableNumber: "G-02", seatingCapacity: 6, status: "AVAILABLE" },
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "+91 98765 43210" },
  { id: "cust-2", name: "Priya Patel", email: "priya.patel@example.com", phone: "+91 98123 45678" },
  { id: "cust-3", name: "Ananya Roy", email: "ananya.roy@example.com", phone: "+91 97788 99001" },
];

export const initialPaymentMethods: PaymentMethodConfig[] = [
  { id: "pm-1", type: "CASH", name: "Cash", isEnabled: true },
  { id: "pm-2", type: "CARD", name: "Card / Digital", isEnabled: true },
  { id: "pm-3", type: "UPI", name: "UPI QR Code", upiId: "caffinecafe@ybl", isEnabled: true },
];

export const initialCoupons: Coupon[] = [
  { id: "coup-1", code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10, isActive: true },
  { id: "coup-2", code: "FLAT50", discountType: "FIXED", discountValue: 50, minimumOrderAmount: 300, isActive: true },
  { id: "coup-3", code: "VIP20", discountType: "PERCENTAGE", discountValue: 20, minimumOrderAmount: 500, isActive: true },
];

export const initialPromotions: Promotion[] = [
  { id: "prom-1", name: "Buy 3 Coffee Get 15% Off", scope: "PRODUCT", productId: "prod-2", minimumQuantity: 3, discountType: "PERCENTAGE", discountValue: 15, isActive: true },
  { id: "prom-2", name: "Orders Above ₹600 Get ₹100 Off", scope: "ORDER", minimumOrderAmount: 600, discountType: "FIXED", discountValue: 100, isActive: true },
];

export const initialOrders: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "ORD-1001",
    tableId: "tbl-1",
    tableName: "T-01 (Main Hall)",
    customerId: "cust-1",
    customerName: "Rahul Sharma",
    type: "DINE_IN",
    status: "PAID",
    subtotalAmount: 370,
    taxAmount: 18.5,
    discountAmount: 0,
    payableAmount: 388.5,
    paidAmount: 388.5,
    items: [
      { productId: "prod-2", productName: "Cappuccino", unitPrice: 180, quantity: 1, unitOfMeasure: "PIECE", discountAmount: 0, lineTotal: 180 },
      { productId: "prod-3", productName: "Caffè Latte", unitPrice: 190, quantity: 1, unitOfMeasure: "PIECE", discountAmount: 0, lineTotal: 190 },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ord-1002",
    orderNumber: "ORD-1002",
    tableId: "tbl-6",
    tableName: "B-02 (First Floor)",
    customerId: "cust-2",
    customerName: "Priya Patel",
    type: "DINE_IN",
    status: "SENT_TO_KITCHEN",
    subtotalAmount: 490,
    taxAmount: 24.5,
    discountAmount: 50,
    payableAmount: 464.5,
    paidAmount: 0,
    items: [
      { productId: "prod-4", productName: "Iced Caramel Macchiato", unitPrice: 220, quantity: 1, unitOfMeasure: "PIECE", discountAmount: 0, lineTotal: 220 },
      { productId: "prod-9", productName: "Avocado Toast", unitPrice: 260, quantity: 1, unitOfMeasure: "PIECE", discountAmount: 0, lineTotal: 260 },
    ],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const initialKitchenTickets: KitchenTicket[] = [
  {
    id: "kt-1001",
    ticketNumber: "ORD-1002",
    orderId: "ord-1002",
    tableName: "B-02 (First Floor)",
    status: "TO_COOK",
    sentAt: new Date(Date.now() - 1800000).toISOString(),
    items: [
      { id: "kti-1", productId: "prod-4", productName: "Iced Caramel Macchiato", quantity: 1, isCompleted: false },
      { id: "kti-2", productId: "prod-9", productName: "Avocado Toast", quantity: 1, isCompleted: false },
    ],
  },
  {
    id: "kt-1002",
    ticketNumber: "ORD-1001",
    orderId: "ord-1001",
    tableName: "T-01 (Main Hall)",
    status: "COMPLETED",
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { id: "kti-3", productId: "prod-2", productName: "Cappuccino", quantity: 1, isCompleted: true },
      { id: "kti-4", productId: "prod-3", productName: "Caffè Latte", quantity: 1, isCompleted: true },
    ],
  },
];
