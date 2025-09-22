/*
  Warnings:

  - You are about to drop the column `String` on the `Monthly_view` table. All the data in the column will be lost.
  - Added the required column `tanggal` to the `Monthly_view` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Monthly_view" DROP COLUMN "String",
ADD COLUMN     "tanggal" TIMESTAMP(3) NOT NULL;
