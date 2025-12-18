<?php
require_once __DIR__ . '/../config.php';

class AdminController {

    public static function getAllUsersProgress() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            jsonResponse(['success' => false, 'message' => 'Only GET method is allowed'], 405);
        }

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("
                SELECT 
                    u.id,
                    u.username,
                    u.role,
                    u.created_at as user_created_at,
                    sp.stage,
                    sp.completed,
                    sp.completed_at
                FROM users u
                LEFT JOIN stage_progress sp ON u.id = sp.user_id
                WHERE u.role != 'admin'
                ORDER BY u.id, sp.stage
            ");
            $stmt->execute();
            $rows = $stmt->fetchAll();
            
            $usersMap = [];
            foreach ($rows as $row) {
                $userId = $row['id'];
                if (!isset($usersMap[$userId])) {
                    $usersMap[$userId] = [
                        'id' => $row['id'],
                        'username' => $row['username'],
                        'role' => $row['role'],
                        'createdAt' => $row['user_created_at'],
                        'progress' => []
                    ];
                }
                if ($row['stage']) {
                    $usersMap[$userId]['progress'][$row['stage']] = [
                        'completed' => (bool)$row['completed'],
                        'completedAt' => $row['completed_at']
                    ];
                }
            }
            
            jsonResponse([
                'success' => true,
                'message' => 'All users progress retrieved',
                'data' => array_values($usersMap)
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to get users progress: ' . $e->getMessage()
            ], 500);
        }
    }
}
