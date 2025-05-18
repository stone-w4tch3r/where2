/*
  Warnings:

  - You are about to drop the column `popularName` on the `stations` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `stations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stations" DROP COLUMN "popularName",
DROP COLUMN "shortName";
