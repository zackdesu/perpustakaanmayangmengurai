/*
  Warnings:

  - You are about to drop the column `Judul` on the `book` table. All the data in the column will be lost.
  - Added the required column `judul` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `Judul`,
    ADD COLUMN `judul` VARCHAR(191) NOT NULL;
