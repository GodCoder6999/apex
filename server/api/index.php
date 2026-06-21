<?php
// Front controller for the Apex API. Apache rewrites /api/* here (.htaccess).
// REST: GET /api/<resource>            list
//       GET /api/<resource>/<id>       one
//       POST /api/<resource>           create (body = app-shaped object)
//       PUT /api/<resource>/<id>       update
//       DELETE /api/<resource>/<id>    delete
// Special: GET  /api/bootstrap         every collection in one payload
//          POST /api/orders            create order (marks units sold, records payment)
//          POST /api/payments/collect  collect against a customer's oldest dues
//          POST /api/auth/seller       seller login check (email + password)
declare(strict_types=1);
require __DIR__ . '/config.php';

// resource → [table, pk, columns(col=>jsonKey), nums, bools, jsons]
$SCHEMA = [
  'categories' => ['categories', 'id',
    ['id'=>'id','name'=>'name','active'=>'active'], [], ['active'], []],
  'products' => ['products', 'id',
    ['id'=>'id','name'=>'name','category_id'=>'categoryId','barcode'=>'barcode','price'=>'price',
     'cost_price'=>'costPrice','gst_rate'=>'gstRate','hsn'=>'hsn','brand'=>'brand','specs'=>'specs',
     'image'=>'image','active'=>'active'],
    ['price','costPrice','gstRate'], ['active'], []],
  'units' => ['units', 'id',
    ['id'=>'id','product_id'=>'productId','serial'=>'serial','cost_price'=>'costPrice','status'=>'status',
     'held_by'=>'heldBy','sold_order_id'=>'soldOrderId','added_at'=>'addedAt'],
    ['costPrice','addedAt'], [], []],
  'customers' => ['customers', 'id',
    ['id'=>'id','name'=>'name','phone'=>'phone','address'=>'address','gstin'=>'gstin'], [], [], []],
  'sellers' => ['sellers', 'id',
    ['id'=>'id','name'=>'name','phone'=>'phone','email'=>'email','password'=>'password','active'=>'active'],
    [], ['active'], []],
  'orders' => ['orders', 'id',
    ['id'=>'id','invoice_no'=>'invoiceNo','customer_id'=>'customerId','lines'=>'lines','sub_total'=>'subTotal',
     'discount_total'=>'discountTotal','tax_total'=>'taxTotal','grand_total'=>'grandTotal','paid_now'=>'paidNow',
     'due'=>'due','sold_by'=>'soldBy','method'=>'method','created_at'=>'createdAt'],
    ['subTotal','discountTotal','taxTotal','grandTotal','paidNow','due','createdAt'], [], ['lines']],
  'payments' => ['payments', 'id',
    ['id'=>'id','customer_id'=>'customerId','order_id'=>'orderId','amount'=>'amount','method'=>'method',
     'collected_by'=>'collectedBy','for_due'=>'forDue','at'=>'at'],
    ['amount','at'], ['forDue'], []],
  'enquiries' => ['enquiries', 'id',
    ['id'=>'id','customer_id'=>'customerId','name'=>'name','phone'=>'phone','items'=>'items','note'=>'note',
     'status'=>'status','created_at'=>'createdAt'],
    ['createdAt'], [], ['items']],
];

function rowOut(array $row, array $res): array {
  [, , $cols, $nums, $bools, $jsons] = $res;
  $out = [];
  foreach ($cols as $col => $key) {
    if (!array_key_exists($col, $row)) continue;
    $v = $row[$col];
    if ($v === null) { $out[$key] = null; continue; }
    if (in_array($key, $jsons, true)) $out[$key] = json_decode((string)$v, true);
    elseif (in_array($key, $bools, true)) $out[$key] = (bool)$v;
    elseif (in_array($key, $nums, true)) $out[$key] = $key === 'createdAt' || $key === 'addedAt' || $key === 'at' ? (int)$v : (float)$v;
    else $out[$key] = $v;
  }
  return $out;
}
function rowIn(array $obj, array $res): array {
  [, , $cols, , $bools, $jsons] = $res;
  $row = [];
  foreach ($cols as $col => $key) {
    if (!array_key_exists($key, $obj)) continue;
    $v = $obj[$key];
    if (in_array($key, $jsons, true)) $v = json_encode($v ?? []);
    elseif (in_array($key, $bools, true)) $v = $v ? 1 : 0;
    $row[$col] = $v;
  }
  return $row;
}

// ---- parse path: everything after /api/ ----
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = preg_replace('#^.*/api/?#', '', $uri);            // e.g. "products/p-1"
$parts = array_values(array_filter(explode('/', trim($path, '/')), fn($p) => $p !== ''));
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$resource = $parts[0] ?? '';
$id = $parts[1] ?? null;

// ---- special routes ----
if ($resource === '' || $resource === 'bootstrap') { bootstrap($SCHEMA); }
if ($resource === 'auth' && ($parts[1] ?? '') === 'seller' && $method === 'POST') { sellerLogin(); }
if ($resource === 'orders' && $method === 'POST') { createOrder($SCHEMA); }
if ($resource === 'payments' && ($parts[1] ?? '') === 'collect' && $method === 'POST') { collect(); }
if ($resource === 'settings') { settings($SCHEMA, $method); }

if (!isset($SCHEMA[$resource])) fail('Unknown resource: ' . $resource, 404);
$res = $SCHEMA[$resource];
[$table, $pk] = $res;

switch ($method) {
  case 'GET':
    if ($id === null) {
      $rows = pdo()->query("SELECT * FROM `$table`")->fetchAll();
      ok(array_map(fn($r) => rowOut($r, $res), $rows));
    }
    $st = pdo()->prepare("SELECT * FROM `$table` WHERE `$pk` = ?");
    $st->execute([$id]);
    $row = $st->fetch();
    $row ? ok(rowOut($row, $res)) : fail('Not found', 404);

  case 'POST':
  case 'PUT':
  case 'PATCH':
    $obj = body();
    if ($method !== 'POST' && $id !== null) $obj[$res[2][$pk] ?? 'id'] = $id;
    if (empty($obj['id'])) $obj['id'] = uid(substr($resource, 0, 2));
    if ($resource === 'sellers' && !empty($obj['password'])) $obj['password'] = password_hash($obj['password'], PASSWORD_BCRYPT);
    $row = rowIn($obj, $res);
    upsert($table, $pk, $row);
    $st = pdo()->prepare("SELECT * FROM `$table` WHERE `$pk` = ?");
    $st->execute([$row[$pk]]);
    ok(rowOut($st->fetch(), $res), $method === 'POST' ? 201 : 200);

  case 'DELETE':
    if ($id === null) fail('id required', 400);
    $st = pdo()->prepare("DELETE FROM `$table` WHERE `$pk` = ?");
    $st->execute([$id]);
    if ($resource === 'products') { $d = pdo()->prepare('DELETE FROM units WHERE product_id = ?'); $d->execute([$id]); }
    ok(['ok' => true]);

  default:
    fail('Method not allowed', 405);
}

// ---------------------------------------------------------------------------
function upsert(string $table, string $pk, array $row): void {
  $cols = array_keys($row);
  $place = implode(',', array_map(fn($c) => ":$c", $cols));
  $set = implode(',', array_map(fn($c) => "`$c`=VALUES(`$c`)", array_filter($cols, fn($c) => $c !== $pk)));
  $sql = "INSERT INTO `$table` (`" . implode('`,`', $cols) . "`) VALUES ($place)"
       . ($set ? " ON DUPLICATE KEY UPDATE $set" : '');
  $st = pdo()->prepare($sql);
  foreach ($row as $c => $v) $st->bindValue(":$c", $v);
  $st->execute();
}

function bootstrap(array $SCHEMA): void {
  $out = [];
  foreach ($SCHEMA as $name => $res) {
    $rows = pdo()->query("SELECT * FROM `{$res[0]}`")->fetchAll();
    $out[$name] = array_map(fn($r) => rowOut($r, $res), $rows);
  }
  $s = pdo()->query('SELECT * FROM settings WHERE id = 1')->fetch();
  $out['settings'] = $s ? [
    'name'=>$s['name'],'address'=>$s['address'],'gstin'=>$s['gstin'],'state'=>$s['state'],
    'logo'=>$s['logo'],'phone'=>$s['phone'],'invoicePrefix'=>$s['invoice_prefix'],'taxDefault'=>(float)$s['tax_default'],
  ] : null;
  ok($out);
}

function settings(array $SCHEMA, string $method): void {
  if ($method === 'GET') {
    $s = pdo()->query('SELECT * FROM settings WHERE id = 1')->fetch();
    ok($s ? [
      'name'=>$s['name'],'address'=>$s['address'],'gstin'=>$s['gstin'],'state'=>$s['state'],
      'logo'=>$s['logo'],'phone'=>$s['phone'],'invoicePrefix'=>$s['invoice_prefix'],'taxDefault'=>(float)$s['tax_default'],
    ] : null);
  }
  if ($method === 'PUT' || $method === 'POST') {
    $b = body();
    $st = pdo()->prepare('UPDATE settings SET name=?,address=?,gstin=?,state=?,logo=?,phone=?,invoice_prefix=?,tax_default=? WHERE id=1');
    $st->execute([$b['name']??'', $b['address']??'', $b['gstin']??'', $b['state']??'', $b['logo']??null,
                  $b['phone']??'', $b['invoicePrefix']??'APX', $b['taxDefault']??18]);
    ok(['ok' => true]);
  }
  fail('Method not allowed', 405);
}

// POST /orders — body: {customerId, lines[], discountTotal, paidNow, method, soldBy}
function createOrder(array $SCHEMA): void {
  $b = body();
  $lines = $b['lines'] ?? [];
  if (!$lines) fail('No line items', 400);
  $pdo = pdo();
  $pdo->beginTransaction();
  try {
    // atomic invoice number
    $pdo->exec("UPDATE counters SET value = value + 1 WHERE name = 'invoice'");
    $seq = (int)$pdo->query("SELECT value FROM counters WHERE name = 'invoice'")->fetchColumn();
    $prefix = (string)$pdo->query('SELECT invoice_prefix FROM settings WHERE id = 1')->fetchColumn();
    $invoiceNo = sprintf('%s/26-27/%04d', $prefix ?: 'SND', $seq);

    $subTotal = array_sum(array_map(fn($l) => (float)$l['price'], $lines));
    $lineDisc = array_sum(array_map(fn($l) => (float)($l['discount'] ?? 0), $lines));
    $taxTotal = array_sum(array_map(fn($l) => (float)($l['taxAmt'] ?? 0), $lines));
    $discountTotal = $lineDisc + (float)($b['discountTotal'] ?? 0);
    $grand = $subTotal - $discountTotal + $taxTotal;
    $paid = min((float)($b['paidNow'] ?? 0), $grand);
    $id = uid('o');
    $now = (int)(microtime(true) * 1000);

    $st = $pdo->prepare('INSERT INTO orders (id,invoice_no,customer_id,lines,sub_total,discount_total,tax_total,grand_total,paid_now,due,sold_by,method,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $st->execute([$id, $invoiceNo, $b['customerId'] ?? null, json_encode($lines), $subTotal, $discountTotal,
      $taxTotal, $grand, $paid, $grand - $paid, $b['soldBy'] ?? 'owner', $b['method'] ?? 'cash', $now]);

    $mark = $pdo->prepare("UPDATE units SET status='sold', sold_order_id=? WHERE serial=?");
    foreach ($lines as $l) if (!empty($l['serial'])) $mark->execute([$id, $l['serial']]);

    if ($paid > 0) {
      $p = $pdo->prepare('INSERT INTO payments (id,customer_id,order_id,amount,method,collected_by,for_due,at) VALUES (?,?,?,?,?,?,0,?)');
      $p->execute([uid('pay'), $b['customerId'] ?? null, $id, $paid, $b['method'] ?? 'cash', $b['soldBy'] ?? 'owner', $now]);
    }
    $pdo->commit();
    $row = $pdo->query("SELECT * FROM orders WHERE id = " . $pdo->quote($id))->fetch();
    ok(rowOut($row, $SCHEMA['orders']), 201);
  } catch (Throwable $e) {
    $pdo->rollBack();
    fail('Order creation failed', 500);
  }
}

// POST /payments/collect — body: {customerId, amount, method}
function collect(): void {
  $b = body();
  $cid = $b['customerId'] ?? null;
  $amount = (float)($b['amount'] ?? 0);
  if (!$cid || $amount <= 0) fail('customerId and amount required', 400);
  $pdo = pdo();
  $pdo->beginTransaction();
  try {
    $orders = $pdo->prepare('SELECT id, due, paid_now FROM orders WHERE customer_id = ? AND due > 0 ORDER BY created_at ASC');
    $orders->execute([$cid]);
    $remaining = $amount;
    $upd = $pdo->prepare('UPDATE orders SET paid_now = paid_now + ?, due = due - ? WHERE id = ?');
    foreach ($orders->fetchAll() as $o) {
      if ($remaining <= 0) break;
      $pay = min((float)$o['due'], $remaining);
      $upd->execute([$pay, $pay, $o['id']]);
      $remaining -= $pay;
    }
    $p = $pdo->prepare('INSERT INTO payments (id,customer_id,order_id,amount,method,collected_by,for_due,at) VALUES (?,?,NULL,?,?,?,1,?)');
    $p->execute([uid('pay'), $cid, $amount, $b['method'] ?? 'cash', 'owner', (int)(microtime(true) * 1000)]);
    $pdo->commit();
    ok(['ok' => true, 'applied' => $amount - max(0, $remaining)]);
  } catch (Throwable $e) {
    $pdo->rollBack();
    fail('Collection failed', 500);
  }
}

// POST /auth/seller — body: {email, password}
function sellerLogin(): void {
  $b = body();
  $st = pdo()->prepare('SELECT * FROM sellers WHERE email = ? AND active = 1');
  $st->execute([$b['email'] ?? '']);
  $s = $st->fetch();
  if (!$s || empty($s['password'])) fail('Invalid credentials', 401);
  $hash = $s['password'];
  // Accept bcrypt hashes; fall back to plain match for seed rows.
  $valid = (strlen($hash) > 0 && $hash[0] === '$') ? password_verify($b['password'] ?? '', $hash) : hash_equals($hash, (string)($b['password'] ?? ''));
  if (!$valid) fail('Invalid credentials', 401);
  ok(['id' => $s['id'], 'name' => $s['name'], 'email' => $s['email'], 'role' => 'seller']);
}
