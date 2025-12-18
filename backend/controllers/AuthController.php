<?php
require_once __DIR__ . '/../config.php';

class AuthController {
    public static function register() {
        // Only allow POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (empty($input['username']) || empty($input['password'])) {
            jsonResponse([
                'success' => false,
                'message' => 'Username and password are required'
            ], 400);
        }

        $username = trim($input['username']);
        $password = $input['password'];

        try {
            $pdo = getDBConnection();
            
            // Check if username already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
            $stmt->execute(['username' => $username]);
            if ($stmt->fetch()) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Username already exists'
                ], 409);
            }
            
            // Insert new user (without hashing password)
            $stmt = $pdo->prepare("
                INSERT INTO users (username, password, created_at) 
                VALUES (:username, :password, NOW())
            ");
            
            $stmt->execute([
                'username' => $username,
                'password' => $password
            ]);
            
            $userId = $pdo->lastInsertId();
            
            jsonResponse([
                'success' => true,
                'message' => 'User registered successfully',
                'user' => [
                    'id' => $userId,
                    'username' => $username
                ]
            ], 201);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function login() {
        // Only allow POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (empty($input['username']) || empty($input['password'])) {
            jsonResponse([
                'success' => false,
                'message' => 'Username and password are required'
            ], 400);
        }

        $username = trim($input['username']);
        $password = $input['password'];

        try {
            $pdo = getDBConnection();
            
            // Find user by username
            $stmt = $pdo->prepare("
                SELECT id, username, password, role 
                FROM users 
                WHERE username = :username
            ");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch();
            
            // Check if user exists and password is correct (direct comparison, no hash)
            if (!$user || $user['password'] !== $password) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Invalid username or password'
                ], 401);
            }
            
            // Start session and store user data
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            // Return user info (without password)
            jsonResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role'] ?? 'user'
                ],
                'sessionId' => session_id()
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
