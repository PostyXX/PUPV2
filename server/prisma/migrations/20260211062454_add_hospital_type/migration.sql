-- AlterTable
ALTER TABLE `hospital` ADD COLUMN `type` ENUM('hospital', 'clinic') NOT NULL DEFAULT 'hospital';
