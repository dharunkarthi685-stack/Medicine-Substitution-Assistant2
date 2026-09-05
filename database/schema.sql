-- Medicine Substitution Assistant Database Schema (MySQL Compatible)
-- Create Database
CREATE DATABASE IF NOT EXISTS `medicine_substitute_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `medicine_substitute_db`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users_user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `password` VARCHAR(128) NOT NULL,
    `last_login` DATETIME(6) NULL,
    `is_superuser` TINYINT(1) NOT NULL DEFAULT 0,
    `email` VARCHAR(254) NOT NULL UNIQUE,
    `username` VARCHAR(150) NOT NULL UNIQUE,
    `first_name` VARCHAR(150) NOT NULL DEFAULT '',
    `last_name` VARCHAR(150) NOT NULL DEFAULT '',
    `phone` VARCHAR(20) NOT NULL DEFAULT '',
    `address` LONGTEXT NOT NULL DEFAULT '',
    `city` VARCHAR(100) NOT NULL DEFAULT '',
    `state` VARCHAR(100) NOT NULL DEFAULT '',
    `pincode` VARCHAR(10) NOT NULL DEFAULT '',
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `date_joined` DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medicines Table
CREATE TABLE IF NOT EXISTS `medicines_medicine` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `generic_name` VARCHAR(255) NOT NULL,
    `composition` VARCHAR(255) NOT NULL,
    `strength` VARCHAR(100) NOT NULL,
    `dosage_form` VARCHAR(100) NOT NULL,
    `manufacturer` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `expiry_date` DATE NOT NULL,
    `prescription_required` TINYINT(1) NOT NULL DEFAULT 0,
    `disease_category` VARCHAR(100) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL DEFAULT '',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `search_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    INDEX `idx_med_comp` (`composition`),
    INDEX `idx_med_cat` (`disease_category`),
    INDEX `idx_med_name` (`name`),
    INDEX `idx_med_gen` (`generic_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders_order` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `user_id` BIGINT NOT NULL,
    `fulfillment_type` VARCHAR(20) NOT NULL DEFAULT 'HOME_DELIVERY', -- HOME_DELIVERY or PHARMACY_PICKUP
    `shipping_name` VARCHAR(150) NOT NULL,
    `shipping_phone` VARCHAR(20) NOT NULL,
    `shipping_address` LONGTEXT NOT NULL,
    `shipping_city` VARCHAR(100) NOT NULL,
    `shipping_state` VARCHAR(100) NOT NULL,
    `shipping_pincode` VARCHAR(10) NOT NULL,
    `payment_method` VARCHAR(20) NOT NULL DEFAULT 'RAZORPAY', -- RAZORPAY or COD
    `payment_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    `order_status` VARCHAR(30) NOT NULL DEFAULT 'PLACED', -- PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `delivery_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS `orders_orderitem` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `medicine_id` BIGINT NOT NULL,
    `medicine_name` VARCHAR(255) NOT NULL,
    `dosage_form` VARCHAR(100) NOT NULL,
    `strength` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders_order` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`medicine_id`) REFERENCES `medicines_medicine` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments / Transactions Table
CREATE TABLE IF NOT EXISTS `payments_transaction` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL UNIQUE,
    `razorpay_order_id` VARCHAR(100) NOT NULL DEFAULT '',
    `razorpay_payment_id` VARCHAR(100) NOT NULL DEFAULT '',
    `razorpay_signature` VARCHAR(255) NOT NULL DEFAULT '',
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    `raw_response` LONGTEXT NOT NULL DEFAULT '',
    `created_at` DATETIME(6) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders_order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
