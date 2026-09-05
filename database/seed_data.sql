-- Demo seed data for Medicine Substitution Assistant (MySQL)
USE `medicine_substitute_db`;

-- Demo Admin & User (Passwords hashed with PBKDF2 or default)
-- Password for admin@medassist.com: adminpassword123
-- Password for patient@example.com: userpassword123

INSERT INTO `users_user` (`id`, `password`, `is_superuser`, `email`, `username`, `first_name`, `last_name`, `phone`, `address`, `city`, `state`, `pincode`, `role`, `is_staff`, `is_active`, `date_joined`)
VALUES 
(1, 'pbkdf2_sha256$870000$h7s38kd89f7s$kX8N2V5L4/O129sdu8273hjsd8f=', 1, 'admin@medassist.com', 'admin@medassist.com', 'Medical', 'Director', '+91 98765 43210', 'Healthcare Center, Central Avenue', 'Chennai', 'Tamil Nadu', '600001', 'admin', 1, 1, NOW()),
(2, 'pbkdf2_sha256$870000$h7s38kd89f7s$kX8N2V5L4/O129sdu8273hjsd8f=', 0, 'patient@example.com', 'patient@example.com', 'Rahul', 'Sharma', '+91 91234 56789', 'Flat 402, Green Meadows, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040', 'user', 0, 1, NOW())
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Core Medicines
INSERT INTO `medicines_medicine` (`id`, `name`, `generic_name`, `composition`, `strength`, `dosage_form`, `manufacturer`, `price`, `stock_quantity`, `expiry_date`, `prescription_required`, `disease_category`, `description`, `image_url`, `is_active`, `search_count`, `created_at`, `updated_at`)
VALUES
(1, 'Dolo 650', 'Paracetamol', 'Paracetamol', '650mg', 'Tablet', 'Micro Labs Ltd', 31.00, 180, '2028-12-31', 0, 'Fever & Pain Relief', 'Trusted antipyretic and pain reliever tablet for fever and headaches.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 140, NOW(), NOW()),
(2, 'Calpol 650', 'Paracetamol', 'Paracetamol', '650mg', 'Tablet', 'GSK Pharmaceuticals', 33.50, 150, '2028-10-15', 0, 'Fever & Pain Relief', 'Clinically proven Paracetamol 650mg tablet for high fever.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 95, NOW(), NOW()),
(3, 'Pacimol 650', 'Paracetamol', 'Paracetamol', '650mg', 'Tablet', 'Ipca Laboratories', 18.50, 220, '2028-02-28', 0, 'Fever & Pain Relief', 'Economical high quality generic Paracetamol 650mg tablet.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 78, NOW(), NOW()),
(4, 'Parafast 650', 'Paracetamol', 'Paracetamol', '650mg', 'Tablet', 'Cipla Ltd', 14.00, 300, '2028-05-30', 0, 'Fever & Pain Relief', 'Generic Jan Aushadhi equivalent pure Paracetamol 650mg.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 60, NOW(), NOW()),
(5, 'Augmentin 625 Duo', 'Amoxicillin and Potassium Clavulanate', 'Amoxicillin (500mg) + Clavulanic Acid (125mg)', '625mg', 'Tablet', 'GSK India', 225.00, 75, '2027-06-30', 1, 'Antibiotics & Anti-Infectives', 'Potent broad-spectrum antibacterial medicine.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400', 1, 180, NOW(), NOW()),
(6, 'Moxikind-CV 625', 'Amoxicillin and Potassium Clavulanate', 'Amoxicillin (500mg) + Clavulanic Acid (125mg)', '625mg', 'Tablet', 'Mankind Pharma', 130.00, 140, '2028-09-20', 1, 'Antibiotics & Anti-Infectives', 'Cost-effective alternative with matching Amoxicillin and Clavulanate ratios.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400', 1, 125, NOW(), NOW()),
(7, 'Telma 40', 'Telmisartan', 'Telmisartan', '40mg', 'Tablet', 'Glenmark Pharmaceuticals', 148.00, 130, '2028-05-30', 1, 'Cardiovascular & Hypertension', 'First line Angiotensin Receptor Blocker prescribed for chronic hypertension.', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', 1, 160, NOW(), NOW()),
(8, 'Telmikind 40', 'Telmisartan', 'Telmisartan', '40mg', 'Tablet', 'Mankind Pharma', 65.00, 210, '2028-01-10', 1, 'Cardiovascular & Hypertension', 'Budget-friendly daily antihypertensive tablet offering 55% savings.', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', 1, 115, NOW(), NOW()),
(9, 'Pan 40', 'Pantoprazole', 'Pantoprazole', '40mg', 'Tablet', 'Alkem Laboratories', 160.00, 160, '2028-07-20', 0, 'Gastrointestinal & Acidity', 'Proton pump inhibitor (PPI) providing relief from acid reflux.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 175, NOW(), NOW()),
(10, 'Pantodac 40', 'Pantoprazole', 'Pantoprazole', '40mg', 'Tablet', 'Zydus Cadila', 98.00, 190, '2028-12-05', 0, 'Gastrointestinal & Acidity', 'Trusted generic alternative for controlling gastric acid secretion.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 105, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=`name`;
