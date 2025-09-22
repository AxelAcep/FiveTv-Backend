/*
  Warnings:

  - You are about to drop the `monthly_view` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "monthly_view";

-- CreateTable
CREATE TABLE "Monthly_view" (
    "id" SERIAL NOT NULL,
    "String" TIMESTAMP(3) NOT NULL,
    "jenisId" INTEGER,
    "views" INTEGER NOT NULL,

    CONSTRAINT "Monthly_view_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Monthly_view" ADD CONSTRAINT "Monthly_view_jenisId_fkey" FOREIGN KEY ("jenisId") REFERENCES "Jenis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
