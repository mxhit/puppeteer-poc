-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "buyerName" VARCHAR(100) NOT NULL,
    "buyerAddress" TEXT NOT NULL,
    "gstin" VARCHAR(30) NOT NULL,
    "sellerName" VARCHAR(100) NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quality" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "deliverySchedule" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "brokerage" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);
