<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../types.php';

class ProgressController {

    public static function saveProgress() {
        // Only allow POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (empty($input['userId']) || empty($input['stage'])) {
            jsonResponse([
                'success' => false,
                'message' => 'userId and stage are required'
            ], 400);
        }

        $userId = intval($input['userId']);
        $stage = trim($input['stage'] ?? '');
        $completed = isset($input['completed']) ? (bool)$input['completed'] : true;

        if (!in_array($stage, StageTypes::VALID_STAGES, true)) {
            jsonResponse([
                'success' => false,
                'message' => 'Invalid stage name. Must be one of: ' . implode(', ', StageTypes::VALID_STAGES)
            ], 400);
        }

        try {
            $pdo = getDBConnection();
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = :userId");
            $stmt->execute(['userId' => $userId]);
            if (!$stmt->fetch()) {
                jsonResponse([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            // Insert or update progress
            $stmt = $pdo->prepare("
                INSERT INTO stage_progress (user_id, stage, completed, completed_at)
                VALUES (:userId, :stage, :completed, :completedAt)
                ON DUPLICATE KEY UPDATE 
                    completed = VALUES(completed),
                    completed_at = VALUES(completed_at),
                    updated_at = NOW()
            ");
            
            $stmt->execute([
                'userId' => $userId,
                'stage' => $stage,
                'completed' => $completed ? 1 : 0,
                'completedAt' => $completed ? date('Y-m-d H:i:s') : null
            ]);
            
            jsonResponse([
                'success' => true,
                'message' => 'Progress saved successfully',
                'data' => [
                    'userId' => $userId,
                    'stage' => $stage,
                    'completed' => $completed
                ]
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to save progress: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function getProgress() {
        // Allow GET or POST requests
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $userId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;
            $stage = isset($_GET['stage']) ? trim($_GET['stage']) : '';
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = isset($input['userId']) ? intval($input['userId']) : 0;
            $stage = isset($input['stage']) ? trim($input['stage']) : '';
        } else {
            jsonResponse(['success' => false, 'message' => 'Only GET or POST method is allowed'], 405);
        }

        // Validate input
        if (empty($userId) || empty($stage)) {
            jsonResponse([
                'success' => false,
                'message' => 'userId and stage are required'
            ], 400);
        }

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("
                SELECT stage, completed, completed_at
                FROM stage_progress
                WHERE user_id = :userId AND stage = :stage
            ");
            $stmt->execute(['userId' => $userId, 'stage' => $stage]);
            $progress = $stmt->fetch();
            
            if (!$progress) {
                jsonResponse([
                    'success' => true,
                    'message' => 'No progress found for this stage',
                    'data' => [
                        'stage' => $stage,
                        'completed' => false,
                        'completedAt' => null
                    ]
                ], 200);
            }
            
            jsonResponse([
                'success' => true,
                'message' => 'Progress retrieved successfully',
                'data' => [
                    'stage' => $progress['stage'],
                    'completed' => (bool)$progress['completed'],
                    'completedAt' => $progress['completed_at']
                ]
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to get progress: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function getAllProgress() {
        // Allow GET or POST requests
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $userId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = isset($input['userId']) ? intval($input['userId']) : 0;
        } else {
            jsonResponse(['success' => false, 'message' => 'Only GET or POST method is allowed'], 405);
        }

        // Validate input
        if (empty($userId)) {
            jsonResponse([
                'success' => false,
                'message' => 'userId is required'
            ], 400);
        }

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("
                SELECT stage, completed, completed_at
                FROM stage_progress
                WHERE user_id = :userId
                ORDER BY stage
            ");
            $stmt->execute(['userId' => $userId]);
            $progressList = $stmt->fetchAll();
            
            // Convert to associative array
            $progressMap = [];
            foreach ($progressList as $progress) {
                $progressMap[$progress['stage']] = [
                    'completed' => (bool)$progress['completed'],
                    'completedAt' => $progress['completed_at']
                ];
            }
            
            jsonResponse([
                'success' => true,
                'message' => 'All progress retrieved successfully',
                'data' => $progressMap
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to get all progress: ' . $e->getMessage()
            ], 500);
        }
    }
}
