<?php
require_once "db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$name     = trim($_POST['name'] ?? '');
$email    = trim($_POST['email'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$pincode  = trim($_POST['pincode'] ?? '');
$address  = trim($_POST['address'] ?? '');
$payment  = trim($_POST['payment'] ?? '');
$notes    = trim($_POST['notes'] ?? '');
$items    = $_POST['items'] ?? '[]';
$total    = floatval($_POST['total'] ?? 0);

if ($name === '' || $email === '' || $phone === '' || $address === '' || $payment === '') {
    jsonResponse(false, "Please fill all required fields", null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, "Invalid email", null, 400);
}

try {
    $pdo->beginTransaction();

    // Insert order
    $stmt = $pdo->prepare("
        INSERT INTO orders
        (customer_name, email, phone, pincode, address, payment_method, notes, items_json, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([$name, $email, $phone, $pincode, $address, $payment, $notes, $items, $total]);
    $orderId = $pdo->lastInsertId();

    $pdo->commit();

    jsonResponse(true, "Order placed successfully", ["order_id" => "FL-" . $orderId], 201);
} catch (PDOException $e) {
    $pdo->rollBack();
    jsonResponse(false, "Server error: " . $e->getMessage(), null, 500);
}
?>