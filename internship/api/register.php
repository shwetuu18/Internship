<?php
require_once "db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$name     = trim($_POST['name'] ?? '');
$email    = trim($_POST['email'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirm'] ?? '';

// Validation
if ($name === '' || $email === '' || $password === '') {
    jsonResponse(false, "Please fill all required fields", null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, "Invalid email address", null, 400);
}

if (strlen($password) < 6) {
    jsonResponse(false, "Password must be at least 6 characters", null, 400);
}

if ($password !== $confirm) {
    jsonResponse(false, "Passwords do not match", null, 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, phone, password, role)
        VALUES (?, ?, ?, ?, 'user')
    ");
    $stmt->execute([$name, $email, $phone, $hash]);

    $userId = $pdo->lastInsertId();

    jsonResponse(true, "Registration successful", ["id" => $userId], 201);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonResponse(false, "Email already registered", null, 409);
    }
    jsonResponse(false, "Server error: " . $e->getMessage(), null, 500);
}
?>