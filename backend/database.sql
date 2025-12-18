-- Create database
DROP DATABASE IF EXISTS health_edu_db;
CREATE DATABASE IF NOT EXISTS health_edu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE health_edu_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: CVML, password: 114DWP2025)
INSERT INTO users (username, password, role, created_at) 
VALUES ('CVML', '114DWP2025', 'admin', NOW())
ON DUPLICATE KEY UPDATE username=username;

-- Create stage_progress table to track user quiz completion
CREATE TABLE IF NOT EXISTS stage_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stage VARCHAR(20) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_stage (user_id, stage),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_stage (stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create questions table for quiz questions
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage VARCHAR(20) NOT NULL,
    question_type ENUM('single', 'multiple') NOT NULL DEFAULT 'single',
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answers JSON NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_stage (stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create quiz_attempts table to record user quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create quiz_attempt_answers table to record individual question answers
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answers JSON NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert pre-built quiz questions (created by admin user id=1)
INSERT INTO questions (stage, question_type, question_text, options, correct_answers, created_by) VALUES
('stage1', 'multiple', '下列哪些是腎臟維持體內平衡的重要功能？（可複選）', '["調節鈉鉀濃度", "維持酸鹼平衡", "控制血糖", "排除代謝廢物"]', '[0, 1, 3]', 1),
('stage2', 'single', '哪一項檢驗數據可以直接評估腎臟功能？', '["血色素（Hb）", "肌酸酐（Cr）", "膽固醇（Chol）", "尿酸（UA）"]', '[1]', 1),
('stage3', 'multiple', '下列哪些是慢性腎臟病的高風險因子？（可複選）', '["糖尿病", "高血壓", "腎臟病家族史", "規律運動"]', '[0, 1, 2]', 1),
('stage4', 'single', '慢性腎臟病患者的水分攝取應該如何調整？', '["越多越好", "依據尿量和醫囑調整", "完全不喝水", "只喝運動飲料"]', '[1]', 1),
('stage5', 'single', '慢性腎臟病患者每週建議的運動時間是多少？', '["每週 30 分鐘", "每週 90 分鐘", "每週至少 150 分鐘", "完全不運動"]', '[2]', 1),
('stage6', 'multiple', '下列哪些屬於「三高」？（可複選）', '["高血壓", "高血糖", "高血脂", "高尿酸"]', '[0, 1, 2]', 1),
('stage7', 'single', '腎臟病患者的蛋白質攝取建議量是多少？', '["越多越好", "0.6～0.8 g/kg 體重", "完全不吃蛋白質", "2.0 g/kg 體重"]', '[1]', 1),
('stage8', 'single', '下列哪種藥物對腎臟病患者風險較高，應避免長期使用？', '["維他命 C", "非類固醇消炎止痛藥（NSAIDs）", "胃藥", "感冒糖漿"]', '[1]', 1),
('stage9', 'multiple', '下列哪些是腎友維持健康的日常保健習慣？（可複選）', '["正確洗手", "規律運動", "足夠睡眠", "經常熬夜"]', '[0, 1, 2]', 1);
