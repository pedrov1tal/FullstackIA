ALTER TABLE "parts" ADD COLUMN "minimum_stock" INTEGER NOT NULL DEFAULT 0;

CREATE TYPE "StockMovementType" AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT');

CREATE TABLE "services" (
  "id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "suggested_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

CREATE TABLE "order_services" (
  "service_order_id" UUID NOT NULL,
  "service_id" UUID NOT NULL,
  "unit_price" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_services_pkey" PRIMARY KEY ("service_order_id", "service_id")
);
CREATE INDEX "order_services_service_id_idx" ON "order_services"("service_id");

CREATE TABLE "stock_movements" (
  "id" UUID NOT NULL,
  "part_id" UUID NOT NULL,
  "service_order_id" UUID,
  "type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "note" VARCHAR(255),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "stock_movements_part_id_idx" ON "stock_movements"("part_id");
CREATE INDEX "stock_movements_service_order_id_idx" ON "stock_movements"("service_order_id");

CREATE TABLE "service_order_history" (
  "id" UUID NOT NULL,
  "service_order_id" UUID NOT NULL,
  "previous_status" "ServiceOrderStatus",
  "new_status" "ServiceOrderStatus" NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "service_order_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "service_order_history_service_order_id_idx" ON "service_order_history"("service_order_id");

ALTER TABLE "order_services" ADD CONSTRAINT "order_services_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_services" ADD CONSTRAINT "order_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_order_history" ADD CONSTRAINT "service_order_history_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
