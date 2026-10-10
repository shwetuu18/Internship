<?php
// ============================================
// DATABASE CONNECTION (PDO) — SHARED
// ============================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DB_HOST = "localhost";
$DB_NAME = "fitlife";
$DB_USER = "root";
$DB_PASS = "";

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $e->getMessage()]);
    exit;
}

// Helper: send JSON response
function jsonResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    $payload = ["success" => $success, "message" => $message];
    if ($data !== null) $payload["data"] = $data;
    echo json_encode($payload);
    exit;
}
?>