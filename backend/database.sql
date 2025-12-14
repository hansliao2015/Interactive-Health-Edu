-- Create database
DROP DATABASE IF EXISTS health_edu_db;
CREATE DATABASE IF NOT EXISTS health_edu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE health_edu_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default user (username: CVML, password: 114DWP2025)
INSERT INTO users (username, password, created_at) 
VALUES ('CVML', '114DWP2025', NOW())
ON DUPLICATE KEY UPDATE username=username;
