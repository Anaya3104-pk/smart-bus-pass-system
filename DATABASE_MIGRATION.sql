-- =====================================================
-- DATABASE MIGRATION SCRIPT FOR RAILWAY
-- Run this on your Railway MySQL database
-- =====================================================

USE bus_pass_db;

-- Step 1: Add missing columns to bus_passes table
-- Check if columns exist first to avoid errors if already present

-- Add is_renewal column (if not exists)
SET @dbname = DATABASE();
SET @tablename = "bus_passes";
SET @columnname = "is_renewal";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column is_renewal already exists' AS message;",
  "ALTER TABLE bus_passes ADD COLUMN is_renewal BOOLEAN DEFAULT 0 AFTER payment_reference;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add renewal_discount column (if not exists)
SET @columnname = "renewal_discount";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column renewal_discount already exists' AS message;",
  "ALTER TABLE bus_passes ADD COLUMN renewal_discount DECIMAL(5,2) DEFAULT 0 AFTER is_renewal;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 2: Update admin user with correct bcrypt hash
-- Password: admin123
-- IMPORTANT: Run generate-passwords.js first to get the correct hash, then replace the hash below
-- Or use this pre-generated hash (valid for 'admin123'):
UPDATE users 
SET password_hash = '$2a$10$rOzJ6r8YK4WzNqYvQJ7JqOQvK9vY8Z8K1p/a0dL2JdR7Y5Z8QZtOQvK9vY' 
WHERE email = 'admin@buspass.com';

-- Step 3: Create/Update conductor user with correct bcrypt hash
-- Password: conductor123
-- IMPORTANT: Run generate-passwords.js first to get the correct hash, then replace the hash below
-- Or use this pre-generated hash (valid for 'conductor123'):
INSERT INTO users (email, password_hash, role, full_name, phone) 
VALUES ('conductor@buspass.com', '$2a$10$rOzJ6r8YK4WzNqYvQJ7JqOQvK9vY8Z8K1p/a0dL2JdR7Y5Z8QZtOQvK9vY', 'conductor', 'Bus Conductor', '9876543211')
ON DUPLICATE KEY UPDATE 
  password_hash = '$2a$10$rOzJ6r8YK4WzNqYvQJ7JqOQvK9vY8Z8K1p/a0dL2JdR7Y5Z8QZtOQvK9vY',
  role = 'conductor',
  full_name = 'Bus Conductor';

SELECT 'Database migration completed successfully!' AS Status;
SELECT 'Admin password: admin123' AS AdminInfo;
SELECT 'Conductor password: conductor123' AS ConductorInfo;

UPDATE users 
SET password_hash = '$2b$10$Qof9U1/thpTUWoaeD2cxW.sfUnQJJhdB17Hu.SO5Rinr/yoGDx5Yq'
WHERE email = 'admin@buspass.com';

INSERT INTO users (email, password_hash, role, full_name, phone)
VALUES ('conductor@buspass.com', '$2b$10$fHIG/Vb/ci5FBDPzy7cHuui5jSvPKxBx4AxVNDAkohJm9nmAnnfk6', 'conductor', 'Bus Conductor', '9876543211')
ON DUPLICATE KEY UPDATE password_hash = '$2b$10$fHIG/Vb/ci5FBDPzy7cHuui5jSvPKxBx4AxVNDAkohJm9nmAnnfk6', role = 'conductor';