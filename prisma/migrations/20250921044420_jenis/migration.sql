-- AlterTable
ALTER TABLE "Konten" ADD COLUMN     "jenisId" INTEGER;

-- CreateTable
CREATE TABLE "Jenis" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Jenis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jenis_nama_key" ON "Jenis"("nama");

-- AddForeignKey
ALTER TABLE "Konten" ADD CONSTRAINT "Konten_jenisId_fkey" FOREIGN KEY ("jenisId") REFERENCES "Jenis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
