-- CreateTable
CREATE TABLE "WebsiteConfig" (
    "id" SERIAL NOT NULL,
    "desc_satu" TEXT,
    "desc_dua" TEXT,
    "visi" TEXT,
    "misi" TEXT,
    "struktur" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "linkedin" TEXT,
    "banner" TEXT,
    "kontenI_id" TEXT,
    "kontenII_id" TEXT,
    "kontenIII_id" TEXT,

    CONSTRAINT "WebsiteConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebsiteConfig" ADD CONSTRAINT "WebsiteConfig_kontenI_id_fkey" FOREIGN KEY ("kontenI_id") REFERENCES "Konten"("kodeKonten") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteConfig" ADD CONSTRAINT "WebsiteConfig_kontenII_id_fkey" FOREIGN KEY ("kontenII_id") REFERENCES "Konten"("kodeKonten") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteConfig" ADD CONSTRAINT "WebsiteConfig_kontenIII_id_fkey" FOREIGN KEY ("kontenIII_id") REFERENCES "Konten"("kodeKonten") ON DELETE SET NULL ON UPDATE CASCADE;
