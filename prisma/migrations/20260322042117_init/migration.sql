-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TOP', 'BOTTOM', 'OUTERWEAR', 'SHOES', 'ACCESSORIES');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'WASH', 'REPAIR', 'DONATED', 'ARCHIVED', 'LOST');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "images" TEXT[],
    "video_url" TEXT,
    "brand" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "wash_instructions" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "base_color" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "material" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "season" "Season" NOT NULL,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearLog" (
    "id" TEXT NOT NULL,
    "worn_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "WearLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "outfit_name" TEXT NOT NULL,
    "season_genre" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "outfit_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfit_id","item_id")
);

-- AddForeignKey
ALTER TABLE "WearLog" ADD CONSTRAINT "WearLog_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
