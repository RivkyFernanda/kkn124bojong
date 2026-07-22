<?php
// submit_pesan.php
// Backend Handler untuk Formulir Kontak via AJAX

header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

// Memastikan method request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Metode request tidak diizinkan.'
    ]);
    exit;
}

// Mengambil dan membersihkan input
$nama = isset($_POST['nama']) ? trim(strip_tags($_POST['nama'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$subjek = isset($_POST['subjek']) ? trim(strip_tags($_POST['subjek'])) : '';
$pesan = isset($_POST['pesan']) ? trim(strip_tags($_POST['pesan'])) : '';

// Validasi input
if (empty($nama) || empty($email) || empty($subjek) || empty($pesan)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Semua kolom formulir wajib diisi!'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Format alamat email tidak valid.'
    ]);
    exit;
}

// Cek apakah Firebase terhubung
if ($firebase_ready) {
    $data = [
        'nama' => $nama,
        'email' => $email,
        'subjek' => $subjek,
        'pesan' => $pesan,
        'tanggal' => date('Y-m-d H:i:s')
    ];
    
    // Kirim POST request ke Firebase untuk menambah pesan baru
    $res = firebase_request('pesan.json', 'POST', $data);
    
    if ($res !== null) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Terima kasih! Pesan Anda telah berhasil dikirim dan disimpan.'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Terjadi kesalahan sistem saat menyimpan pesan. Silakan coba lagi.'
        ]);
    }
} else {
    // Simulasi sukses jika berjalan dalam Mode Demo tanpa Firebase
    echo json_encode([
        'status' => 'success',
        'message' => 'Pesan terkirim! (Mode Demo: Firebase belum terpasang, pengiriman disimulasikan sukses).'
    ]);
}
?>
