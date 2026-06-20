<?php
// Shared bootstrap: PDO connection, CORS, JSON helpers. Required by index.php.
declare(strict_types=1);

$credFile = __DIR__ . '/db_credentials.php';
if (!file_exists($credFile)) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'db_credentials.php missing. Copy db_credentials.sample.php and fill it in.']);
  exit;
}
$cfg = require $credFile;

// ---- CORS ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = array_map('trim', explode(',', (string)($cfg['cors_origins'] ?? '*')));
if (in_array('*', $allowed, true)) {
  header('Access-Control-Allow-Origin: *');
} elseif ($origin && in_array($origin, $allowed, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

// ---- PDO ----
function pdo(): PDO {
  static $pdo = null;
  if ($pdo !== null) return $pdo;
  global $cfg;
  $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset={$cfg['charset']}";
  try {
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
  } catch (Throwable $e) {
    fail('Database connection failed', 500);
  }
  return $pdo;
}

// ---- helpers ----
function body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === '' || $raw === false) return [];
  $d = json_decode($raw, true);
  return is_array($d) ? $d : [];
}
function ok($data, int $code = 200): void { http_response_code($code); echo json_encode($data); exit; }
function fail(string $msg, int $code = 400): void { http_response_code($code); echo json_encode(['error' => $msg]); exit; }
function uid(string $p): string { return $p . '-' . base_convert((string)time(), 10, 36) . '-' . bin2hex(random_bytes(3)); }
