<?php
// Copy this file to `db_credentials.php` on the server and fill in the MySQL
// details from Hostinger (hPanel → Databases → MySQL Databases).
// db_credentials.php is git-ignored so secrets never reach the repo.
return [
  'host'    => 'localhost',          // Hostinger MySQL host (usually localhost)
  'name'    => 'u123456789_apex',    // database name
  'user'    => 'u123456789_apex',    // database user
  'pass'    => 'CHANGE_ME',          // database password
  'charset' => 'utf8mb4',
  // Comma-separated origins allowed to call the API (the website URL).
  // Use '*' while testing, then lock to your domain.
  'cors_origins' => '*',
];
