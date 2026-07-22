<?php
// logout.php
// Keluar dari sesi admin KKN 124 Desa Bojong

require_once 'config.php';

// Hapus semua data sesi
$_SESSION = array();

// Hapus cookie sesi jika ada
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Hancurkan sesi
session_destroy();

// Alihkan kembali ke halaman utama
header("Location: index.php");
exit;
?>
