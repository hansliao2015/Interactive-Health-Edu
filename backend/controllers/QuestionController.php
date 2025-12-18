<?php
require_once __DIR__ . '/../config.php';

class QuestionController {

    public static function createQuestion() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['stage']) || empty($input['questionText']) || empty($input['options']) || empty($input['correctAnswers'])) {
            jsonResponse([
                'success' => false,
                'message' => 'stage, questionText, options, and correctAnswers are required'
            ], 400);
        }

        $stage = trim($input['stage']);
        $questionType = $input['questionType'] ?? 'single';
        $questionText = trim($input['questionText']);
        $options = $input['options'];
        $correctAnswers = $input['correctAnswers'];
        $createdBy = intval($input['createdBy'] ?? 0);

        if (!in_array($questionType, ['single', 'multiple'])) {
            jsonResponse([
                'success' => false,
                'message' => 'questionType must be single or multiple'
            ], 400);
        }

        if (!is_array($options) || count($options) < 2) {
            jsonResponse([
                'success' => false,
                'message' => 'options must be an array with at least 2 items'
            ], 400);
        }

        if (!is_array($correctAnswers) || count($correctAnswers) < 1) {
            jsonResponse([
                'success' => false,
                'message' => 'correctAnswers must be an array with at least 1 item'
            ], 400);
        }

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("
                INSERT INTO questions (stage, question_type, question_text, options, correct_answers, created_by)
                VALUES (:stage, :questionType, :questionText, :options, :correctAnswers, :createdBy)
            ");
            
            $stmt->execute([
                'stage' => $stage,
                'questionType' => $questionType,
                'questionText' => $questionText,
                'options' => json_encode($options, JSON_UNESCAPED_UNICODE),
                'correctAnswers' => json_encode($correctAnswers, JSON_UNESCAPED_UNICODE),
                'createdBy' => $createdBy
            ]);
            
            $questionId = $pdo->lastInsertId();
            
            jsonResponse([
                'success' => true,
                'message' => 'Question created successfully',
                'data' => [
                    'id' => intval($questionId),
                    'stage' => $stage,
                    'questionType' => $questionType,
                    'questionText' => $questionText,
                    'options' => $options,
                    'correctAnswers' => $correctAnswers
                ]
            ], 201);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to create question: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function getQuestions() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            jsonResponse(['success' => false, 'message' => 'Only GET method is allowed'], 405);
        }

        $stage = isset($_GET['stage']) ? trim($_GET['stage']) : null;

        try {
            $pdo = getDBConnection();
            
            if ($stage) {
                $stmt = $pdo->prepare("
                    SELECT id, stage, question_type, question_text, options, correct_answers, created_at
                    FROM questions
                    WHERE stage = :stage
                    ORDER BY created_at DESC
                ");
                $stmt->execute(['stage' => $stage]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT id, stage, question_type, question_text, options, correct_answers, created_at
                    FROM questions
                    ORDER BY stage, created_at DESC
                ");
                $stmt->execute();
            }
            
            $questions = $stmt->fetchAll();
            
            $result = array_map(function($q) {
                return [
                    'id' => intval($q['id']),
                    'stage' => $q['stage'],
                    'questionType' => $q['question_type'],
                    'questionText' => $q['question_text'],
                    'options' => json_decode($q['options'], true),
                    'correctAnswers' => json_decode($q['correct_answers'], true),
                    'createdAt' => $q['created_at']
                ];
            }, $questions);
            
            jsonResponse([
                'success' => true,
                'message' => 'Questions retrieved successfully',
                'data' => $result
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to get questions: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function updateQuestion() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['id'])) {
            jsonResponse([
                'success' => false,
                'message' => 'id is required'
            ], 400);
        }

        $id = intval($input['id']);
        $stage = isset($input['stage']) ? trim($input['stage']) : null;
        $questionType = $input['questionType'] ?? null;
        $questionText = isset($input['questionText']) ? trim($input['questionText']) : null;
        $options = $input['options'] ?? null;
        $correctAnswers = $input['correctAnswers'] ?? null;

        try {
            $pdo = getDBConnection();
            
            $updates = [];
            $params = ['id' => $id];
            
            if ($stage !== null) {
                $updates[] = "stage = :stage";
                $params['stage'] = $stage;
            }
            if ($questionType !== null) {
                $updates[] = "question_type = :questionType";
                $params['questionType'] = $questionType;
            }
            if ($questionText !== null) {
                $updates[] = "question_text = :questionText";
                $params['questionText'] = $questionText;
            }
            if ($options !== null) {
                $updates[] = "options = :options";
                $params['options'] = json_encode($options, JSON_UNESCAPED_UNICODE);
            }
            if ($correctAnswers !== null) {
                $updates[] = "correct_answers = :correctAnswers";
                $params['correctAnswers'] = json_encode($correctAnswers, JSON_UNESCAPED_UNICODE);
            }
            
            if (empty($updates)) {
                jsonResponse([
                    'success' => false,
                    'message' => 'No fields to update'
                ], 400);
            }
            
            $sql = "UPDATE questions SET " . implode(", ", $updates) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            jsonResponse([
                'success' => true,
                'message' => 'Question updated successfully'
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to update question: ' . $e->getMessage()
            ], 500);
        }
    }

    public static function deleteQuestion() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'message' => 'Only POST method is allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['id'])) {
            jsonResponse([
                'success' => false,
                'message' => 'id is required'
            ], 400);
        }

        $id = intval($input['id']);

        try {
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("DELETE FROM questions WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Question not found'
                ], 404);
            }
            
            jsonResponse([
                'success' => true,
                'message' => 'Question deleted successfully'
            ], 200);
            
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'message' => 'Failed to delete question: ' . $e->getMessage()
            ], 500);
        }
    }
}
