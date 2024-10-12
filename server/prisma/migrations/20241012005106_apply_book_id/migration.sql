/*
  Warnings:

  - The primary key for the `book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `loan` DROP FOREIGN KEY `Loan_bookId_fkey`;

-- DropIndex
DROP INDEX `Book_id_key` ON `book`;

-- AlterTable
ALTER TABLE `book` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `bookId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`bookId`);

-- CreateIndex
CREATE UNIQUE INDEX `Book_bookId_key` ON `Book`(`bookId`);

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`bookId`) ON DELETE RESTRICT ON UPDATE CASCADE;
