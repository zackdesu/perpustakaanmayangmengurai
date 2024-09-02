-- CreateTable
CREATE TABLE `Token` (
    `refreshToken` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Token_refreshToken_key`(`refreshToken`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_refreshToken_fkey` FOREIGN KEY (`refreshToken`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
