ALTER TYPE "account_role" ADD VALUE 'MANAGER' BEFORE 'CASHIER';--> statement-breakpoint
ALTER TYPE "account_role" ADD VALUE 'KITCHEN';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "auth_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_auth_user_id_unique" ON "accounts" ("auth_user_id");