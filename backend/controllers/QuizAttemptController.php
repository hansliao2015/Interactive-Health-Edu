<?php
/**
 * Quiz Attempt Controller
 * 
 * Handles quiz attempt operations including:
 * - Starting a new quiz attempt
 * - Recording answers
 * - Completing attempts
 * - Getting attempt history
 */

class QuizAttemptController {
    
    /**
     * Start a new quiz attempt
     * POST: { userId: number }
     */
    public static function startAttempt() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['userId'])) {
            jsonResponse(['success' => false, 'message' => 'userId is required'], 400);
            return;
        }

        $userId = intval($data['userId']);

        try {
            $pdo = getDBConnection();
            
            // Count total questions available
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM questions");
            $totalQuestions = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            if ($totalQuestions == 0) {
                jsonResponse(['success' => false, 'message' => 'No questions available'], 400);
                return;
            }

            // Create new attempt
            $stmt = $pdo->prepare("
                INSERT INTO quiz_attempts (user_id, total_questions, correct_count, score_percentage, started_at)
                VALUES (?, ?, 0, 0.00, NOW())
            ");
            $stmt->execute([$userId, $totalQuestions]);
            $attemptId = $pdo->lastInsertId();

            jsonResponse([
                'success' => true,
                'message' => 'Quiz attempt started',
                'data' => [
                    'attemptId' => intval($attemptId),
                    'totalQuestions' => intval($totalQuestions)
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Record an answer for a quiz attempt
     * POST: { attemptId: number, questionId: number, userAnswers: number[], isCorrect: boolean }
     */
    public static function recordAnswer() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        $required = ['attemptId', 'questionId', 'userAnswers', 'isCorrect'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                jsonResponse(['success' => false, 'message' => "$field is required"], 400);
                return;
            }
        }

        $attemptId = intval($data['attemptId']);
        $questionId = intval($data['questionId']);
        $userAnswers = json_encode($data['userAnswers']);
        $isCorrect = $data['isCorrect'] ? 1 : 0;

        try {
            $pdo = getDBConnection();
            
            // Record the answer
            $stmt = $pdo->prepare("
                INSERT INTO quiz_attempt_answers (attempt_id, question_id, user_answers, is_correct, answered_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$attemptId, $questionId, $userAnswers, $isCorrect]);

            // Update correct count in attempt
            if ($isCorrect) {
                $stmt = $pdo->prepare("
                    UPDATE quiz_attempts 
                    SET correct_count = correct_count + 1 
                    WHERE id = ?
                ");
                $stmt->execute([$attemptId]);
            }

            jsonResponse([
                'success' => true,
                'message' => 'Answer recorded'
            ]);
        } catch (PDOException $e) {
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Complete a quiz attempt
     * POST: { attemptId: number }
     */
    public static function completeAttempt() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['attemptId'])) {
            jsonResponse(['success' => false, 'message' => 'attemptId is required'], 400);
            return;
        }

        $attemptId = intval($data['attemptId']);

        try {
            $pdo = getDBConnection();
            
            // Calculate final score percentage
            $stmt = $pdo->prepare("
                UPDATE quiz_attempts 
                SET score_percentage = (correct_count * 100.0 / total_questions),
                    completed_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$attemptId]);

            // Get the completed attempt
            $stmt = $pdo->prepare("SELECT * FROM quiz_attempts WHERE id = ?");
            $stmt->execute([$attemptId]);
            $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'message' => 'Quiz attempt completed',
                'data' => [
                    'attemptId' => intval($attempt['id']),
                    'totalQuestions' => intval($attempt['total_questions']),
                    'correctCount' => intval($attempt['correct_count']),
                    'scorePercentage' => floatval($attempt['score_percentage']),
                    'completedAt' => $attempt['completed_at']
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get quiz attempt history for a user
     * GET: ?userId=number&limit=number
     */
    public static function getAttemptHistory() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
            return;
        }

        if (!isset($_GET['userId'])) {
            jsonResponse(['success' => false, 'message' => 'userId is required'], 400);
            return;
        }

        $userId = intval($_GET['userId']);
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("
                SELECT id, total_questions, correct_count, score_percentage, started_at, completed_at
                FROM quiz_attempts 
                WHERE user_id = ? AND completed_at IS NOT NULL
                ORDER BY completed_at DESC
                LIMIT ?
            ");
            $stmt->execute([$userId, $limit]);
            $attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $result = array_map(function($attempt) {
                return [
                    'id' => intval($attempt['id']),
                    'totalQuestions' => intval($attempt['total_questions']),
                    'correctCount' => intval($attempt['correct_count']),
                    'scorePercentage' => floatval($attempt['score_percentage']),
                    'startedAt' => $attempt['started_at'],
                    'completedAt' => $attempt['completed_at']
                ];
            }, $attempts);

            jsonResponse([
                'success' => true,
                'message' => 'Attempt history retrieved',
                'data' => $result
            ]);
        } catch (PDOException $e) {
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get detailed results for a specific attempt
     * GET: ?attemptId=number
     */
    public static function getAttemptDetails() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
            return;
        }

        if (!isset($_GET['attemptId'])) {
            jsonResponse(['success' => false, 'message' => 'attemptId is required'], 400);
            return;
        }

        $attemptId = intval($_GET['attemptId']);

        try {
            $pdo = getDBConnection();
            
            // Get attempt info
            $stmt = $pdo->prepare("SELECT * FROM quiz_attempts WHERE id = ?");
            $stmt->execute([$attemptId]);
            $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$attempt) {
                jsonResponse(['success' => false, 'message' => 'Attempt not found'], 404);
                return;
            }

            // Get answers with question details
            $stmt = $pdo->prepare("
                SELECT 
                    qaa.question_id,
                    qaa.user_answers,
                    qaa.is_correct,
                    q.question_text,
                    q.options,
                    q.correct_answers
                FROM quiz_attempt_answers qaa
                JOIN questions q ON qaa.question_id = q.id
                WHERE qaa.attempt_id = ?
                ORDER BY qaa.answered_at
            ");
            $stmt->execute([$attemptId]);
            $answers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $formattedAnswers = array_map(function($answer) {
                return [
                    'questionId' => intval($answer['question_id']),
                    'questionText' => $answer['question_text'],
                    'options' => json_decode($answer['options']),
                    'correctAnswers' => json_decode($answer['correct_answers']),
                    'userAnswers' => json_decode($answer['user_answers']),
                    'isCorrect' => (bool)$answer['is_correct']
                ];
            }, $answers);

            jsonResponse([
                'success' => true,
                'message' => 'Attempt details retrieved',
                'data' => [
                    'attempt' => [
                        'id' => intval($attempt['id']),
                        'totalQuestions' => intval($attempt['total_questions']),
                        'correctCount' => intval($attempt['correct_count']),
                        'scorePercentage' => floatval($attempt['score_percentage']),
                        'startedAt' => $attempt['started_at'],
                        'completedAt' => $attempt['completed_at']
                    ],
                    'answers' => $formattedAnswers
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
?>
