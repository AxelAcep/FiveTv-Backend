/*
  Warnings:

  - The values [konten] on the enum `KategoriKonten` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "KategoriKonten_new" AS ENUM ('proker', 'kegiatan', 'artikel');
ALTER TABLE "Konten" ALTER COLUMN "kategori" TYPE "KategoriKonten_new" USING ("kategori"::text::"KategoriKonten_new");
ALTER TYPE "KategoriKonten" RENAME TO "KategoriKonten_old";
ALTER TYPE "KategoriKonten_new" RENAME TO "KategoriKonten";
DROP TYPE "KategoriKonten_old";
COMMIT;
