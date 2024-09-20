-- CreateTable
CREATE TABLE `Acc` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',

    UNIQUE INDEX `Acc_id_key`(`id`),
    UNIQUE INDEX `Acc_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `angkatan` INTEGER NOT NULL,
    `jurusan` VARCHAR(191) NOT NULL,
    `kelas` INTEGER NOT NULL,
    `absentnum` INTEGER NOT NULL,
    `NISN` VARCHAR(191) NULL,
    `NIPD` VARCHAR(191) NULL,
    `Tempat` VARCHAR(191) NULL,
    `TanggalLahir` DATETIME(3) NULL,
    `accId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    UNIQUE INDEX `User_accId_key`(`accId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Loan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `waktuPeminjaman` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `batasPengembalian` DATETIME(3) NOT NULL,
    `waktuKembali` DATETIME(3) NULL,
    `status` ENUM('DIPINJAM', 'DIKEMBALIKAN', 'HILANG') NOT NULL DEFAULT 'DIPINJAM',
    `denda` INTEGER NOT NULL DEFAULT 0,
    `bookCode` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,

    INDEX `Loan_userId_bookId_idx`(`userId`, `bookId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `pengarang` VARCHAR(191) NOT NULL,
    `penerbit` VARCHAR(191) NULL,
    `tahun` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `tag` VARCHAR(191) NULL,
    `type` ENUM('LITERATUR', 'KOMPUTER', 'PSIKOLOGI', 'FILOSOFI', 'SENI', 'BAHASA', 'SEJARAH', 'MATEMATIKA', 'SAINS') NOT NULL,
    `isbn` VARCHAR(191) NULL,

    UNIQUE INDEX `Book_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refreshToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Token_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OTP` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_accId_fkey` FOREIGN KEY (`accId`) REFERENCES `Acc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Acc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Acc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
