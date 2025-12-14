<?php
/**
 * API Router
 * 
 * This file handles routing of API requests to appropriate controllers.
 * All business logic is separated into controller files for better organization.
 */

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

require_once 'config.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/ProgressController.php';

// Get the action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    // Authentication routes
    case 'register':
        AuthController::register();
        break;
    case 'login':
        AuthController::login();
        break;
    
    // Progress routes
    case 'save_progress':
        ProgressController::saveProgress();
        break;
    case 'get_progress':
        ProgressController::getProgress();
        break;
    case 'get_all_progress':
        ProgressController::getAllProgress();
        break;
    
    // Invalid action
    default:
        jsonResponse([
            'success' => false,
            'message' => 'Invalid action. Available actions: register, login, save_progress, get_progress, get_all_progress'
        ], 400);
}
?>
