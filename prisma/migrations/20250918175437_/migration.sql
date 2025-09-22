/*
  Warnings:

  - You are about to drop the column `divisiId` on the `Pengurus` table. All the data in the column will be lost.
  - You are about to drop the `Divisi` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `judul` to the `Konten` table without a default value. This is not possible if the table is not empty.
  - Added the required column `divisi` to the `Pengurus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pengurus" DROP CONSTRAINT "Pengurus_divisiId_fkey";

-- AlterTable
ALTER TABLE "Konten" ADD COLUMN     "Editor" TEXT,
ADD COLUMN     "Reporter" TEXT,
ADD COLUMN     "judul" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pengurus" DROP COLUMN "divisiId",
ADD COLUMN     "Instagram" TEXT,
ADD COLUMN     "divisi" TEXT NOT NULL,
ADD COLUMN     "linkedin" TEXT,
ALTER COLUMN "fotoLink" DROP NOT NULL;

-- DropTable
DROP TABLE "Divisi";
