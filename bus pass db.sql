-- Smart Bus Pass Management System 

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bus_pass_db;
USE bus_pass_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS chatbot_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bus_passes;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin', 'conductor') NOT NULL DEFAULT 'student',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    profile_pic VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE student_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    course VARCHAR(100),
    year INT,
    address TEXT,
    id_card_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    stops JSON,
    distance_km DECIMAL(5,2),
    fare DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    current_lat DECIMAL(10,8),
    current_lng DECIMAL(11,8),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE bus_passes (
    pass_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    pass_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_pass_number (pass_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    pass_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pass_id) REFERENCES bus_passes(pass_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE chatbot_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    query TEXT NOT NULL,
    response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- Insert sample admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
('admin@buspass.com', '$2a$10$xQZ9H8VxhT3.YPH4zR1q4eKGPxYpH3FLxH8.YPH4zR1q4eKGPxYpH3', 'admin', 'System Administrator', '9876543210');

-- Insert sample routes
INSERT INTO routes (route_name, start_point, end_point, stops, distance_km, fare, active) VALUES
('Route 1: College to City Center', 'Main College Gate', 'City Central Bus Stand', '["College Gate", "Sector 5", "Market Square", "Railway Station", "City Center"]', 12.5, 500.00, TRUE),
('Route 2: College to Airport', 'Main College Gate', 'International Airport', '["College Gate", "Tech Park", "Highway Junction", "Airport"]', 25.0, 800.00, TRUE),
('Route 3: College to Residential Area', 'Main College Gate', 'Green Valley Society', '["College Gate", "Hospital", "Shopping Mall", "Green Valley"]', 8.0, 400.00, TRUE);

-- Insert sample buses
INSERT INTO buses (route_id, bus_number, capacity, status) VALUES
(1, 'MH-12-AB-1234', 50, 'active'),
(1, 'MH-12-CD-5678', 50, 'active'),
(2, 'MH-12-EF-9012', 45, 'active'),
(3, 'MH-12-GH-3456', 40, 'active');

SELECT 'Database created successfully! All tables are ready.' AS Status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'bus_pass_db';

USE bus_pass_db;
select * from bus_passes;

-- Add duration and payment reference columns to bus_passes
ALTER TABLE bus_passes 
ADD COLUMN duration ENUM('monthly', '6month', 'yearly') DEFAULT 'monthly' AFTER route_id,
ADD COLUMN payment_status ENUM('pending', 'cash_pending', 'success', 'failed') DEFAULT 'pending' AFTER status,
ADD COLUMN payment_reference VARCHAR(50) AFTER payment_status;

-- Add fare columns for different durations to routes
ALTER TABLE routes
ADD COLUMN fare_6month DECIMAL(10,2) AFTER fare,
ADD COLUMN fare_yearly DECIMAL(10,2) AFTER fare_6month;

-- Update existing routes with 6-month and yearly fares (with discounts)
UPDATE routes SET 
    fare_6month = fare * 5.5,  -- 10% discount (6 months = 5.5x monthly)
    fare_yearly = fare * 10;    -- 20% discount (12 months = 10x monthly)

-- Add columns for GPS tracking to buses
ALTER TABLE buses
ADD COLUMN conductor_id INT AFTER bus_number,
ADD COLUMN is_tracking BOOLEAN DEFAULT FALSE AFTER status;

-- Create table for bus location history (for analytics)
CREATE TABLE IF NOT EXISTS bus_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    INDEX idx_bus_timestamp (bus_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('pass_approved', 'pass_rejected', 'payment_success', 'expiry_warning') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, read_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Database schema updated successfully!' AS Status;

USE bus_pass_db;

-- Add reset token columns to users table
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) AFTER password_hash,
ADD COLUMN reset_token_expiry DATETIME AFTER reset_token;

SELECT 'Reset password columns added successfully!' AS Status;

USE bus_pass_db;

-- Check if columns exist first
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry');

-- Add reset token columns to users table
ALTER TABLE users 
ADD COLUMN  reset_token VARCHAR(255) NULL AFTER password_hash,
ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token;

-- Verify columns were added
DESCRIBE users;

SELECT 'Reset password columns added successfully!' AS Status;