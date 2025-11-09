-- Database schema for Sales Executive App Authentication

-- Table: SalesExecutiveApp_Login
-- This table stores login credentials and user information for the app
CREATE TABLE IF NOT EXISTS SalesExecutiveApp_Login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If table already exists, add the new columns with this ALTER statement:
ALTER TABLE SalesExecutiveApp_Login
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME DEFAULT NULL,
ADD INDEX IF NOT EXISTS idx_reset_token (reset_token);

-- Note: The Executive table should already exist with this structure:
-- TABLE: Executive
-- Columns needed:
--   - employee_id VARCHAR(50)
--   - full_name VARCHAR(100)
--   - email VARCHAR(100)
--   - role VARCHAR(50) -- Must be 'BUSINESS_DEVELOPMENT_EXECUTIVE' for signup
--
-- The signup process validates against this table to ensure only
-- authorized Business Development Executives can register.
