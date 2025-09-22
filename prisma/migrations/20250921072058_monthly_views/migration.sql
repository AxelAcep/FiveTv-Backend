-- CreateTable
CREATE TABLE "monthly_view" (
    "id" SERIAL NOT NULL,
    "String" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL,

    CONSTRAINT "monthly_view_pkey" PRIMARY KEY ("id")
);
