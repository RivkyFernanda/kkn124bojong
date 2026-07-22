<?php
// config.php
// Konfigurasi Firebase & Sesi KKN 124 Desa Bojong

// Memulai sesi untuk autentikasi admin
// lifetime = 0 memastikan cookie sesi HILANG saat browser/tab ditutup
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,         // 0 = cookie berakhir saat browser ditutup (bukan persistent)
        'path'     => '/',
        'httponly' => true,      // Cegah akses JavaScript ke cookie sesi (keamanan XSS)
        'samesite' => 'Strict'   // Cegah CSRF lintas situs
    ]);
    session_start();
}

// ==========================================
// CONFIGURATION PARAMETERS (FIREBASE)
// ==========================================
// Silakan isi sesuai petunjuk di PANDUAN_FIREBASE.md
$firebase_api_key = 'AIzaSyBQFB-dLDEU7xqDA68v4pHBgtMZEaIVcr0';
$firebase_db_url  = 'https://kkn124bojong-default-rtdb.asia-southeast1.firebasedatabase.app/';

// Deteksi apakah konfigurasi Firebase sudah diisi
$firebase_ready = (
    !empty($firebase_api_key) && 
    !empty($firebase_db_url) && 
    strpos($firebase_api_key, 'YOUR_') === false && 
    strpos($firebase_db_url, 'YOUR_') === false
);

// ==========================================
// FIREBASE REST API cURL HELPER
// ==========================================
function firebase_request($path, $method = 'GET', $data = null) {
    global $firebase_db_url;
    
    if (empty($firebase_db_url)) return null;
    
    // Pastikan path berakhiran .json untuk REST API
    $clean_path = ltrim($path, '/');
    
    // Tambahkan parameter auth jika token sesi admin tersedia
    $auth_param = "";
    if (isset($_SESSION['firebase_token'])) {
        $token = $_SESSION['firebase_token'];
        $auth_param = (strpos($clean_path, '?') !== false) ? "&auth={$token}" : "?auth={$token}";
    }
    
    $url = rtrim($firebase_db_url, '/') . '/' . $clean_path . $auth_param;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Kompatibilitas XAMPP Localhost tanpa SSL Cert
    
    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($data !== null) {
            $json_data = json_encode($data);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($json_data)
            ]);
        }
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code >= 200 && $http_code < 300) {
        return json_decode($response, true);
    }
    
    return null;
}

// ==========================================
// SECURITY & SESSION HELPERS
// ==========================================

// Memeriksa apakah admin sedang login
function is_admin_logged_in() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true && isset($_SESSION['firebase_token']);
}

// Sanitasi input form untuk mencegah XSS
function sanitize($data) {
    return htmlspecialchars(trim(strip_tags($data)), ENT_QUOTES, 'UTF-8');
}

// ==========================================
// DYNAMIC DATA RETRIEVAL (Firebase Integration)
// ==========================================

function get_anggota() {
    global $firebase_ready;
    if ($firebase_ready) {
        $res = firebase_request('anggota.json');
        if (is_array($res)) {
            $data = [];
            foreach ($res as $key => $val) {
                if (is_array($val)) {
                    $val['id'] = $key;
                    $data[] = $val;
                }
            }
            // Urutkan berdasarkan urutan ASC
            usort($data, function($a, $b) {
                $ua = isset($a['urutan']) ? intval($a['urutan']) : 0;
                $ub = isset($b['urutan']) ? intval($b['urutan']) : 0;
                return $ua <=> $ub;
            });
            return $data;
        }
    }
    return [];
}

function get_program_kerja() {
    global $firebase_ready;
    if ($firebase_ready) {
        $res = firebase_request('program_kerja.json');
        if (is_array($res)) {
            $data = [];
            foreach ($res as $key => $val) {
                if (is_array($val)) {
                    $val['id'] = $key;
                    $data[] = $val;
                }
            }
            return $data;
        }
    }
    return [];
}

function get_galeri() {
    global $firebase_ready;
    if ($firebase_ready) {
        $res = firebase_request('galeri.json');
        if (is_array($res)) {
            $data = [];
            foreach ($res as $key => $val) {
                if (is_array($val)) {
                    $val['id'] = $key;
                    $data[] = $val;
                }
            }
            // Urutkan berdasarkan tanggal DESC
            usort($data, function($a, $b) {
                $ta = isset($a['tanggal']) ? $a['tanggal'] : '';
                $tb = isset($b['tanggal']) ? $b['tanggal'] : '';
                return strcmp($tb, $ta);
            });
            return $data;
        }
    }
    return [];
}

function get_berita() {
    global $firebase_ready;
    if ($firebase_ready) {
        $res = firebase_request('berita.json');
        if (is_array($res)) {
            $data = [];
            foreach ($res as $key => $val) {
                if (is_array($val)) {
                    $val['id'] = $key;
                    $data[] = $val;
                }
            }
            // Urutkan berdasarkan tanggal DESC
            usort($data, function($a, $b) {
                $ta = isset($a['tanggal']) ? $a['tanggal'] : '';
                $tb = isset($b['tanggal']) ? $b['tanggal'] : '';
                return strcmp($tb, $ta);
            });
            return $data;
        }
    }
    return [];
}

function get_settings() {
    global $firebase_ready;
    $settings = [
        'alamat_posko' => 'Jln. Citumang RT03/RW03 Dusun Sukasari, Desa Bojong, Kec. Parigi, Kabupaten Pangandaran, Jawa Barat 46393',
        'map_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5358043689456!2d108.53032731477764!3d-7.732847994426217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e65bcf44ebbd7af%3A0xe5a3cbeecb5ce53!2sBojong%2C%20Parigi%2C%20Pangandaran%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1680000000000!5m2!1sen!2sid',
        'email' => 'kkn124.bojong@saizu.ac.id',
        'whatsapp' => '+62 823-2412-2026',
        'instagram' => '@diary.bojong124',
        'hari_pengabdian' => '40'
    ];
    if ($firebase_ready) {
        $res = firebase_request('pengaturan.json');
        if (is_array($res)) {
            foreach ($res as $key => $val) {
                $settings[$key] = $val;
            }
        } else {
            // Jika node 'pengaturan' kosong di Firebase, tuliskan data default secara otomatis
            firebase_request('pengaturan.json', 'PUT', $settings);
        }
    }
    return $settings;
}
?>
