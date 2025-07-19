/*
  Warnings:

  - You are about to drop the `Dosen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kehadiran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kelas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KelasMahasiswa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mahasiswa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Matakuliah` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recap` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "KategoriKonten" AS ENUM ('proker', 'kegiatan', 'konten');

-- DropForeignKey
ALTER TABLE "Kehadiran" DROP CONSTRAINT "Kehadiran_kodeRecap_fkey";

-- DropForeignKey
ALTER TABLE "Kehadiran" DROP CONSTRAINT "Kehadiran_nim_fkey";

-- DropForeignKey
ALTER TABLE "Kelas" DROP CONSTRAINT "Kelas_kodeMatakuliah_fkey";

-- DropForeignKey
ALTER TABLE "Kelas" DROP CONSTRAINT "Kelas_nidn_fkey";

-- DropForeignKey
ALTER TABLE "KelasMahasiswa" DROP CONSTRAINT "KelasMahasiswa_kodeKelas_fkey";

-- DropForeignKey
ALTER TABLE "KelasMahasiswa" DROP CONSTRAINT "KelasMahasiswa_kodeMahasiswa_fkey";

-- DropForeignKey
ALTER TABLE "Recap" DROP CONSTRAINT "Recap_kodeKelas_fkey";

-- DropTable
DROP TABLE "Dosen";

-- DropTable
DROP TABLE "Kehadiran";

-- DropTable
DROP TABLE "Kelas";

-- DropTable
DROP TABLE "KelasMahasiswa";

-- DropTable
DROP TABLE "Mahasiswa";

-- DropTable
DROP TABLE "Matakuliah";

-- DropTable
DROP TABLE "Recap";

-- DropEnum
DROP TYPE "Prodi";

-- CreateTable
CREATE TABLE "Admin" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Konten" (
    "kodeKonten" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "view" INTEGER NOT NULL DEFAULT 0,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isiHTML" TEXT NOT NULL,
    "kategori" "KategoriKonten" NOT NULL,

    CONSTRAINT "Konten_pkey" PRIMARY KEY ("kodeKonten")
);

-- CreateTable
CREATE TABLE "Divisi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "Divisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengurus" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "fotoLink" TEXT NOT NULL,
    "divisiId" INTEGER NOT NULL,

    CONSTRAINT "Pengurus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Divisi_nama_key" ON "Divisi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Pengurus_nim_key" ON "Pengurus"("nim");

-- AddForeignKey
ALTER TABLE "Pengurus" ADD CONSTRAINT "Pengurus_divisiId_fkey" FOREIGN KEY ("divisiId") REFERENCES "Divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
