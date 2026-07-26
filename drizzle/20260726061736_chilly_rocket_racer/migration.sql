CREATE TYPE "account_role" AS ENUM('ADMIN', 'CASHIER');--> statement-breakpoint
CREATE TYPE "booking_status" AS ENUM('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "delivery_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "discount_source" AS ENUM('COUPON', 'PROMOTION', 'MANUAL');--> statement-breakpoint
CREATE TYPE "discount_type" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "kitchen_status" AS ENUM('NOT_SENT', 'TO_COOK', 'PREPARING', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('DRAFT', 'SENT_TO_KITCHEN', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "order_type" AS ENUM('DINE_IN', 'TAKEAWAY');--> statement-breakpoint
CREATE TYPE "payment_method_type" AS ENUM('CASH', 'CARD', 'UPI');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "promotion_scope" AS ENUM('PRODUCT', 'ORDER');--> statement-breakpoint
CREATE TYPE "receipt_delivery_type" AS ENUM('PRINT', 'EMAIL');--> statement-breakpoint
CREATE TYPE "record_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "pos_session_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "restaurant_table_status" AS ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "kitchen_ticket_status" AS ENUM('TO_COOK', 'PREPARING', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "unit_of_measure" AS ENUM('PIECE', 'KG', 'GRAM', 'LITRE', 'ML');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"role" "account_role" DEFAULT 'CASHIER'::"account_role" NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(150) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"address" text,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"receipt_prefix" varchar(20) DEFAULT 'ORD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"percentage" numeric(5,2) NOT NULL,
	"is_inclusive" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "taxes_percentage_check" CHECK ("percentage" >= 0 AND "percentage" <= 100)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"tax_id" uuid,
	"name" varchar(150) NOT NULL,
	"description" text,
	"sku" varchar(80),
	"price" numeric(12,2) NOT NULL,
	"unit_of_measure" "unit_of_measure" DEFAULT 'PIECE'::"unit_of_measure" NOT NULL,
	"is_kitchen_item" boolean DEFAULT true NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_check" CHECK ("price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"floor_id" uuid NOT NULL,
	"table_number" varchar(30) NOT NULL,
	"seats" integer DEFAULT 1 NOT NULL,
	"status" "restaurant_table_status" DEFAULT 'AVAILABLE'::"restaurant_table_status" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurant_tables_seats_check" CHECK ("seats" > 0)
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"table_id" uuid,
	"customer_id" uuid,
	"customer_name" varchar(150) NOT NULL,
	"customer_phone" varchar(30) NOT NULL,
	"guest_count" integer NOT NULL,
	"booking_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING'::"booking_status" NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_guest_count_check" CHECK ("guest_count" > 0),
	CONSTRAINT "bookings_duration_check" CHECK ("duration_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"opened_by" uuid NOT NULL,
	"closed_by" uuid,
	"session_number" varchar(50) NOT NULL,
	"opening_cash" numeric(12,2) DEFAULT '0' NOT NULL,
	"closing_cash" numeric(12,2),
	"expected_cash" numeric(12,2),
	"total_sales" numeric(12,2) DEFAULT '0' NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"status" "pos_session_status" DEFAULT 'OPEN'::"pos_session_status" NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"closing_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(150) NOT NULL,
	"quantity" numeric(10,3) NOT NULL,
	"unit_price" numeric(12,2) NOT NULL,
	"tax_rate" numeric(5,2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"line_subtotal" numeric(12,2) NOT NULL,
	"line_total" numeric(12,2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK ("quantity" > 0),
	CONSTRAINT "order_items_amount_check" CHECK ("unit_price" >= 0 AND "line_total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"table_id" uuid,
	"customer_id" uuid,
	"employee_id" uuid NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"order_type" "order_type" DEFAULT 'DINE_IN'::"order_type" NOT NULL,
	"status" "order_status" DEFAULT 'DRAFT'::"order_status" NOT NULL,
	"kitchen_status" "kitchen_status" DEFAULT 'NOT_SENT'::"kitchen_status" NOT NULL,
	"subtotal" numeric(12,2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"notes" text,
	"paid_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_amounts_check" CHECK ("subtotal" >= 0 AND "tax_amount" >= 0 AND "discount_amount" >= 0 AND "total_amount" >= 0 AND "paid_amount" >= 0),
	CONSTRAINT "orders_dine_in_table_check" CHECK ("order_type" <> 'DINE_IN' OR "table_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"coupon_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid,
	"redeemed_by" uuid NOT NULL,
	"discount_amount" numeric(12,2) NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(12,2) NOT NULL,
	"minimum_order_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"maximum_discount_amount" numeric(12,2),
	"usage_limit" integer,
	"usage_limit_per_customer" integer,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_dates_check" CHECK ("ends_at" > "starts_at"),
	CONSTRAINT "coupons_value_check" CHECK ("discount_value" > 0)
);
--> statement-breakpoint
CREATE TABLE "order_discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"coupon_id" uuid,
	"promotion_id" uuid,
	"source" "discount_source" NOT NULL,
	"name" varchar(150) NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(12,2) NOT NULL,
	"discount_amount" numeric(12,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_discounts_amount_check" CHECK ("discount_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "promotion_products" (
	"promotion_id" uuid,
	"product_id" uuid,
	CONSTRAINT "promotion_products_pkey" PRIMARY KEY("promotion_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"scope" "promotion_scope" NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(12,2) NOT NULL,
	"minimum_quantity" numeric(10,3),
	"minimum_order_amount" numeric(12,2),
	"maximum_discount_amount" numeric(12,2),
	"priority" integer DEFAULT 0 NOT NULL,
	"is_stackable" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promotions_dates_check" CHECK ("ends_at" > "starts_at"),
	CONSTRAINT "promotions_value_check" CHECK ("discount_value" > 0)
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"store_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "payment_method_type" NOT NULL,
	"upi_id" varchar(255),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_upi_check" CHECK ("type" <> 'UPI' OR "upi_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"processed_by" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"amount_received" numeric(12,2),
	"change_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"transaction_reference" varchar(255),
	"status" "payment_status" DEFAULT 'PENDING'::"payment_status" NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK ("amount" > 0 AND "change_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "kitchen_ticket_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"kitchen_ticket_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(150) NOT NULL,
	"quantity" numeric(10,3) NOT NULL,
	"status" "kitchen_ticket_status" DEFAULT 'TO_COOK'::"kitchen_ticket_status" NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kitchen_ticket_items_quantity_check" CHECK ("quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "kitchen_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"sequence_number" integer NOT NULL,
	"status" "kitchen_ticket_status" DEFAULT 'TO_COOK'::"kitchen_ticket_status" NOT NULL,
	"sent_by" uuid NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipt_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"delivery_type" "receipt_delivery_type" NOT NULL,
	"recipient_email" varchar(255),
	"status" "delivery_status" DEFAULT 'PENDING'::"delivery_status" NOT NULL,
	"sent_by" uuid NOT NULL,
	"sent_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receipt_deliveries_email_check" CHECK ("delivery_type" <> 'EMAIL' OR "recipient_email" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_email_unique" ON "accounts" ("email");--> statement-breakpoint
CREATE INDEX "accounts_store_idx" ON "accounts" ("store_id");--> statement-breakpoint
CREATE INDEX "stores_name_idx" ON "stores" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_store_name_unique" ON "categories" ("store_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "taxes_store_name_unique" ON "taxes" ("store_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_store_sku_unique" ON "products" ("store_id","sku");--> statement-breakpoint
CREATE INDEX "products_store_category_idx" ON "products" ("store_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "floors_store_name_unique" ON "floors" ("store_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "restaurant_tables_floor_number_unique" ON "restaurant_tables" ("floor_id","table_number");--> statement-breakpoint
CREATE INDEX "bookings_store_date_idx" ON "bookings" ("store_id","booking_at");--> statement-breakpoint
CREATE INDEX "bookings_table_date_idx" ON "bookings" ("table_id","booking_at");--> statement-breakpoint
CREATE INDEX "customers_store_phone_idx" ON "customers" ("store_id","phone");--> statement-breakpoint
CREATE INDEX "customers_store_email_idx" ON "customers" ("store_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "pos_sessions_store_number_unique" ON "pos_sessions" ("store_id","session_number");--> statement-breakpoint
CREATE INDEX "pos_sessions_store_status_idx" ON "pos_sessions" ("store_id","status");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_store_number_unique" ON "orders" ("store_id","order_number");--> statement-breakpoint
CREATE INDEX "orders_session_status_idx" ON "orders" ("session_id","status");--> statement-breakpoint
CREATE INDEX "orders_table_status_idx" ON "orders" ("table_id","status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemptions_order_unique" ON "coupon_redemptions" ("order_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_customer_idx" ON "coupon_redemptions" ("coupon_id","customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_store_code_unique" ON "coupons" ("store_id","code");--> statement-breakpoint
CREATE INDEX "order_discounts_order_idx" ON "order_discounts" ("order_id");--> statement-breakpoint
CREATE INDEX "promotions_store_active_idx" ON "promotions" ("store_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_store_name_unique" ON "payment_methods" ("store_id","name");--> statement-breakpoint
CREATE INDEX "payments_order_status_idx" ON "payments" ("order_id","status");--> statement-breakpoint
CREATE INDEX "payments_session_idx" ON "payments" ("session_id");--> statement-breakpoint
CREATE INDEX "kitchen_ticket_items_ticket_idx" ON "kitchen_ticket_items" ("kitchen_ticket_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kitchen_tickets_order_sequence_unique" ON "kitchen_tickets" ("order_id","sequence_number");--> statement-breakpoint
CREATE UNIQUE INDEX "kitchen_tickets_number_unique" ON "kitchen_tickets" ("ticket_number");--> statement-breakpoint
CREATE INDEX "kitchen_tickets_status_sent_idx" ON "kitchen_tickets" ("status","sent_at");--> statement-breakpoint
CREATE INDEX "receipt_deliveries_order_idx" ON "receipt_deliveries" ("order_id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "taxes" ADD CONSTRAINT "taxes_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tax_id_taxes_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_floor_id_floors_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_table_id_restaurant_tables_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_accounts_id_fkey" FOREIGN KEY ("created_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_opened_by_accounts_id_fkey" FOREIGN KEY ("opened_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_closed_by_accounts_id_fkey" FOREIGN KEY ("closed_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_pos_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "pos_sessions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_restaurant_tables_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_employee_id_accounts_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_redeemed_by_accounts_id_fkey" FOREIGN KEY ("redeemed_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_order_item_id_order_items_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_coupon_id_coupons_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_promotion_id_promotions_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotion_id_promotions_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_id_pos_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "pos_sessions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_accounts_id_fkey" FOREIGN KEY ("processed_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "kitchen_ticket_items" ADD CONSTRAINT "kitchen_ticket_items_kitchen_ticket_id_kitchen_tickets_id_fkey" FOREIGN KEY ("kitchen_ticket_id") REFERENCES "kitchen_tickets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "kitchen_ticket_items" ADD CONSTRAINT "kitchen_ticket_items_order_item_id_order_items_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "kitchen_ticket_items" ADD CONSTRAINT "kitchen_ticket_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "kitchen_tickets" ADD CONSTRAINT "kitchen_tickets_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "kitchen_tickets" ADD CONSTRAINT "kitchen_tickets_sent_by_accounts_id_fkey" FOREIGN KEY ("sent_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipt_deliveries" ADD CONSTRAINT "receipt_deliveries_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "receipt_deliveries" ADD CONSTRAINT "receipt_deliveries_sent_by_accounts_id_fkey" FOREIGN KEY ("sent_by") REFERENCES "accounts"("id") ON DELETE RESTRICT;