/*
  Warnings:

  - You are about to drop the column `userId` on the `loan` table. All the data in the column will be lost.
  - Added the required column `accId` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `loan` DROP FOREIGN KEY `Loan_userId_fkey`;

-- DropIndex
DROP INDEX `Loan_userId_bookId_idx` ON `loan`;

-- AlterTable
ALTER TABLE `loan` CHANGE `userId` `accId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- CreateIndex
CREATE INDEX `Loan_accId_bookId_idx` ON `Loan`(`accId`, `bookId`);

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_accId_fkey` FOREIGN KEY (`accId`) REFERENCES `Acc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
