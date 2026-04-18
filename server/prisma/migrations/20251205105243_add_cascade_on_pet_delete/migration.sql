-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_petId_fkey`;

-- DropForeignKey
ALTER TABLE `medicalrecord` DROP FOREIGN KEY `MedicalRecord_appointmentId_fkey`;

-- DropForeignKey
ALTER TABLE `vaccination` DROP FOREIGN KEY `Vaccination_petId_fkey`;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vaccination` ADD CONSTRAINT `Vaccination_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
