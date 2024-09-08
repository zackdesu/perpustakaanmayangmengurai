/*
  Warnings:

  - You are about to drop the column `author` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `book` table. All the data in the column will be lost.
  - Added the required column `Judul` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pengarang` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `author`,
    DROP COLUMN `name`,
    ADD COLUMN `Judul` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `isbn` VARCHAR(191) NULL,
    ADD COLUMN `penerbit` VARCHAR(191) NULL,
    ADD COLUMN `pengarang` VARCHAR(191) NOT NULL,
    ADD COLUMN `tahun` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;
