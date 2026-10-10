<?php
require_once "db.php";
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    jsonResponse(false, "Email and password required", null, 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, password, role, status
        FROM users
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(false, "Invalid email or password", null, 401);
    }

    if ($user['status'] !== 'active') {
        jsonResponse(false, "Your account has been blocked", null, 403);
    }

    if (!password_verify($password, $user['password'])) {
        jsonResponse(false, "Invalid email or password", null, 401);
    }

    $_SESSION['user'] = [
        "id"    => $user['id'],
        "name"  => $user['name'],
        "email" => $user['email'],
        "phone" => $user['phone'],
        "role"  => $user['role']
    ];

    jsonResponse(true, "Login successful", $_SESSION['user']);
} catch (PDOException $e) {
    jsonResponse(false, "Server error: " . $e->getMessage(), null, 500);
}
?>