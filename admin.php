<?php
// admin.php
// Panel Admin Dashboard CRUD Terpadu KKN 124 Desa Bojong
require_once 'config.php';

// Proteksi Halaman: Jika belum login, redirect ke login.php
if (!is_admin_logged_in()) {
    header('Location: login.php');
    exit;
}

$status = isset($_GET['status']) ? sanitize($_GET['status']) : '';
$msg = isset($_GET['msg']) ? sanitize($_GET['msg']) : '';
$page = isset($_GET['page']) ? sanitize($_GET['page']) : 'dashboard';
$action = isset($_GET['action']) ? sanitize($_GET['action']) : '';
$id = isset($_GET['id']) ? sanitize($_GET['id']) : '';

// ==========================================
// UPLOAD FILE HELPER FUNCTION
// ==========================================
function upload_image($file_input_name, $subfolder) {
    if (!isset($_FILES[$file_input_name]) || $_FILES[$file_input_name]['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    $file = $_FILES[$file_input_name];
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($file_extension, $allowed_extensions)) {
        return ['error' => 'Format file tidak diizinkan! Gunakan JPG, JPEG, PNG, WEBP, atau GIF.'];
    }
    
    // Validasi tipe mime
    $allowed_mimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        if (!in_array($mime, $allowed_mimes)) {
            return ['error' => 'Validasi tipe MIME gagal. Berkas bukan gambar asli.'];
        }
    }
    
    // Batas ukuran file 3MB
    if ($file['size'] > 3 * 1024 * 1024) {
        return ['error' => 'Ukuran berkas terlalu besar! Maksimal adalah 3MB.'];
    }
    
    // Tentukan direktori
    $upload_dir = 'assets/uploads/' . $subfolder . '/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Nama unik
    $filename = $subfolder . '_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
    $destination = $upload_dir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return ['filename' => $filename];
    }
    
    return ['error' => 'Gagal memindahkan file yang diunggah ke server.'];
}

// Helper hapus file foto lama
function delete_uploaded_file($filename, $subfolder) {
    if (empty($filename)) return;
    $path = 'assets/uploads/' . $subfolder . '/' . $filename;
    if (file_exists($path) && is_file($path)) {
        @unlink($path);
    }
}

// ==========================================
// ACTION CONTROLLERS (CRUD HANDLERS)
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. ANGGOTA CRUD POST HANDLERS
    if ($action === 'add_anggota') {
        $nama = sanitize($_POST['nama']);
        $divisi = sanitize($_POST['divisi']);
        $prodi = sanitize($_POST['prodi']);
        $urutan = (int)$_POST['urutan'];
        
        $foto_name = null;
        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $upload_res = upload_image('foto', 'anggota');
            if (isset($upload_res['error'])) {
                header("Location: admin.php?page=anggota&status=error&msg=" . urlencode($upload_res['error']));
                exit;
            }
            $foto_name = $upload_res['filename'];
        }
        
        if ($firebase_ready) {
            $data = [
                'nama' => $nama,
                'foto' => $foto_name,
                'divisi' => $divisi,
                'prodi' => $prodi,
                'urutan' => $urutan
            ];
            firebase_request('anggota.json', 'POST', $data);
            header("Location: admin.php?page=anggota&status=success&msg=Anggota+berhasil+ditambahkan");
            exit;
        } else {
            header("Location: admin.php?page=anggota&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }
    
    if ($action === 'edit_anggota') {
        $id = sanitize($_POST['id']);
        $nama = sanitize($_POST['nama']);
        $divisi = sanitize($_POST['divisi']);
        $prodi = sanitize($_POST['prodi']);
        $urutan = (int)$_POST['urutan'];
        
        if ($firebase_ready) {
            $old_data = firebase_request("anggota/{$id}.json");
            $foto_name = isset($old_data['foto']) ? $old_data['foto'] : null;
            
            if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
                $upload_res = upload_image('foto', 'anggota');
                if (isset($upload_res['error'])) {
                    header("Location: admin.php?page=anggota&status=error&msg=" . urlencode($upload_res['error']));
                    exit;
                }
                if ($foto_name) {
                    delete_uploaded_file($foto_name, 'anggota');
                }
                $foto_name = $upload_res['filename'];
            }
            
            $data = [
                'nama' => $nama,
                'foto' => $foto_name,
                'divisi' => $divisi,
                'prodi' => $prodi,
                'urutan' => $urutan
            ];
            firebase_request("anggota/{$id}.json", 'PUT', $data);
            header("Location: admin.php?page=anggota&status=success&msg=Data+anggota+berhasil+diperbarui");
            exit;
        } else {
            header("Location: admin.php?page=anggota&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }

    // 2. PROGRAM KERJA CRUD POST HANDLERS
    if ($action === 'add_proker') {
        $nama = sanitize($_POST['nama']);
        $deskripsi = sanitize($_POST['deskripsi']);
        $divisi_pelaksana = sanitize($_POST['divisi_pelaksana']);
        $status_proker = sanitize($_POST['status']);
        $icon = sanitize($_POST['icon']);
        
        if ($firebase_ready) {
            $data = [
                'nama' => $nama,
                'deskripsi' => $deskripsi,
                'divisi_pelaksana' => $divisi_pelaksana,
                'status' => $status_proker,
                'icon' => $icon
            ];
            firebase_request('program_kerja.json', 'POST', $data);
            header("Location: admin.php?page=proker&status=success&msg=Program+kerja+berhasil+ditambahkan");
            exit;
        } else {
            header("Location: admin.php?page=proker&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }
    
    if ($action === 'edit_proker') {
        $id = sanitize($_POST['id']);
        $nama = sanitize($_POST['nama']);
        $deskripsi = sanitize($_POST['deskripsi']);
        $divisi_pelaksana = sanitize($_POST['divisi_pelaksana']);
        $status_proker = sanitize($_POST['status']);
        $icon = sanitize($_POST['icon']);
        
        if ($firebase_ready) {
            $data = [
                'nama' => $nama,
                'deskripsi' => $deskripsi,
                'divisi_pelaksana' => $divisi_pelaksana,
                'status' => $status_proker,
                'icon' => $icon
            ];
            firebase_request("program_kerja/{$id}.json", 'PUT', $data);
            header("Location: admin.php?page=proker&status=success&msg=Program+kerja+berhasil+diperbarui");
            exit;
        } else {
            header("Location: admin.php?page=proker&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }

    // 3. GALERI CRUD POST HANDLERS
    if ($action === 'add_galeri') {
        $judul = sanitize($_POST['judul']);
        $deskripsi = sanitize($_POST['deskripsi']);
        $tanggal = sanitize($_POST['tanggal']);
        
        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            header("Location: admin.php?page=galeri&status=error&msg=Foto+dokumentasi+wajib+diunggah!");
            exit;
        }
        
        $upload_res = upload_image('foto', 'galeri');
        if (isset($upload_res['error'])) {
            header("Location: admin.php?page=galeri&status=error&msg=" . urlencode($upload_res['error']));
            exit;
        }
        $foto_name = $upload_res['filename'];
        
        if ($firebase_ready) {
            $data = [
                'judul' => $judul,
                'foto' => $foto_name,
                'deskripsi' => $deskripsi,
                'tanggal' => $tanggal
            ];
            firebase_request('galeri.json', 'POST', $data);
            header("Location: admin.php?page=galeri&status=success&msg=Dokumentasi+galeri+berhasil+ditambahkan");
            exit;
        } else {
            header("Location: admin.php?page=galeri&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }
    
    if ($action === 'edit_galeri') {
        $id = sanitize($_POST['id']);
        $judul = sanitize($_POST['judul']);
        $deskripsi = sanitize($_POST['deskripsi']);
        $tanggal = sanitize($_POST['tanggal']);
        
        if ($firebase_ready) {
            $old_data = firebase_request("galeri/{$id}.json");
            $foto_name = isset($old_data['foto']) ? $old_data['foto'] : '';
            
            if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
                $upload_res = upload_image('foto', 'galeri');
                if (isset($upload_res['error'])) {
                    header("Location: admin.php?page=galeri&status=error&msg=" . urlencode($upload_res['error']));
                    exit;
                }
                if ($foto_name) {
                    delete_uploaded_file($foto_name, 'galeri');
                }
                $foto_name = $upload_res['filename'];
            }
            
            $data = [
                'judul' => $judul,
                'foto' => $foto_name,
                'deskripsi' => $deskripsi,
                'tanggal' => $tanggal
            ];
            firebase_request("galeri/{$id}.json", 'PUT', $data);
            header("Location: admin.php?page=galeri&status=success&msg=Galeri+berhasil+diperbarui");
            exit;
        } else {
            header("Location: admin.php?page=galeri&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }

    // 4. BERITA CRUD POST HANDLERS
    if ($action === 'add_berita') {
        $judul = sanitize($_POST['judul']);
        $konten = sanitize($_POST['konten']);
        $penulis = sanitize($_POST['penulis']);
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $judul)));
        
        $foto_name = null;
        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $upload_res = upload_image('foto', 'berita');
            if (isset($upload_res['error'])) {
                header("Location: admin.php?page=berita&status=error&msg=" . urlencode($upload_res['error']));
                exit;
            }
            $foto_name = $upload_res['filename'];
        }
        
        if ($firebase_ready) {
            $data = [
                'judul' => $judul,
                'slug' => $slug,
                'konten' => $konten,
                'foto' => $foto_name,
                'penulis' => $penulis,
                'tanggal' => date('Y-m-d H:i:s')
            ];
            firebase_request('berita.json', 'POST', $data);
            header("Location: admin.php?page=berita&status=success&msg=Berita+laporan+kegiatan+berhasil+diterbitkan");
            exit;
        } else {
            header("Location: admin.php?page=berita&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }
    
    if ($action === 'edit_berita') {
        $id = sanitize($_POST['id']);
        $judul = sanitize($_POST['judul']);
        $konten = sanitize($_POST['konten']);
        $penulis = sanitize($_POST['penulis']);
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $judul)));
        
        if ($firebase_ready) {
            $old_data = firebase_request("berita/{$id}.json");
            $foto_name = isset($old_data['foto']) ? $old_data['foto'] : null;
            
            if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
                $upload_res = upload_image('foto', 'berita');
                if (isset($upload_res['error'])) {
                    header("Location: admin.php?page=berita&status=error&msg=" . urlencode($upload_res['error']));
                    exit;
                }
                if ($foto_name) {
                    delete_uploaded_file($foto_name, 'berita');
                }
                $foto_name = $upload_res['filename'];
            }
            
            $data = [
                'judul' => $judul,
                'slug' => $slug,
                'konten' => $konten,
                'foto' => $foto_name,
                'penulis' => $penulis,
                'tanggal' => isset($old_data['tanggal']) ? $old_data['tanggal'] : date('Y-m-d H:i:s')
            ];
            firebase_request("berita/{$id}.json", 'PUT', $data);
            header("Location: admin.php?page=berita&status=success&msg=Berita+berhasil+diperbarui");
            exit;
        } else {
            header("Location: admin.php?page=berita&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }
    
    // 5. GANTI SANDI ADMIN POST HANDLER
    if ($action === 'ganti_sandi') {
        $password_lama = isset($_POST['password_lama']) ? $_POST['password_lama'] : '';
        $password_baru = isset($_POST['password_baru']) ? $_POST['password_baru'] : '';
        $konfirmasi_password = isset($_POST['konfirmasi_password']) ? $_POST['konfirmasi_password'] : '';
        
        if (empty($password_lama) || empty($password_baru) || empty($konfirmasi_password)) {
            header("Location: admin.php?page=ganti_sandi&status=error&msg=Semua+kolom+wajib+diisi!");
            exit;
        }
        
        if ($password_baru !== $konfirmasi_password) {
            header("Location: admin.php?page=ganti_sandi&status=error&msg=Konfirmasi+sandi+baru+tidak+cocok.");
            exit;
        }
        
        if (strlen($password_baru) < 6) {
            header("Location: admin.php?page=ganti_sandi&status=error&msg=Sandi+baru+minimal+6+karakter.");
            exit;
        }
        
        if ($firebase_ready) {
            $email = isset($_SESSION['firebase_email']) ? $_SESSION['firebase_email'] : '';
            if (empty($email)) {
                $email = $_SESSION['admin_username'] . '@kkn124bojong.com';
            }
            
            $verify_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" . $firebase_api_key;
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $verify_url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'email' => $email,
                'password' => $password_lama,
                'returnSecureToken' => true
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code === 200) {
                $update_url = "https://identitytoolkit.googleapis.com/v1/accounts:update?key=" . $firebase_api_key;
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $update_url);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                    'idToken' => $_SESSION['firebase_token'],
                    'password' => $password_baru,
                    'returnSecureToken' => true
                ]));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                $up_response = curl_exec($ch);
                $up_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                $up_data = json_decode($up_response, true);
                if ($up_code === 200 && isset($up_data['idToken'])) {
                    $_SESSION['firebase_token'] = $up_data['idToken'];
                    header("Location: admin.php?page=ganti_sandi&status=success&msg=Sandi+berhasil+diubah!");
                    exit;
                } else {
                    header("Location: admin.php?page=ganti_sandi&status=error&msg=Gagal+mengubah+sandi+di+Firebase.");
                    exit;
                }
            } else {
                header("Location: admin.php?page=ganti_sandi&status=error&msg=Sandi+lama+yang+Anda+masukkan+salah.");
                exit;
            }
        } else {
            header("Location: admin.php?page=ganti_sandi&status=success&msg=Sandi+disimulasikan+berhasil+diubah+(Mode+Demo)!");
            exit;
        }
    }
    
    // 6. EDIT PENGATURAN POST HANDLER
    if ($action === 'edit_pengaturan') {
        $alamat_posko = sanitize($_POST['alamat_posko']);
        $map_embed = trim($_POST['map_embed']);
        $email = sanitize($_POST['email']);
        $whatsapp = sanitize($_POST['whatsapp']);
        $instagram = sanitize($_POST['instagram']);
        $hari_pengabdian = sanitize($_POST['hari_pengabdian']);
        
        if (preg_match('/src="([^"]+)"/', $map_embed, $matches)) {
            $map_embed = $matches[1];
        }
        
        if ($firebase_ready) {
            $updates = [
                'alamat_posko' => $alamat_posko,
                'map_embed' => $map_embed,
                'email' => $email,
                'whatsapp' => $whatsapp,
                'instagram' => $instagram,
                'hari_pengabdian' => $hari_pengabdian
            ];
            
            firebase_request('pengaturan.json', 'PUT', $updates);
            header("Location: admin.php?page=pengaturan&status=success&msg=Pengaturan+posko+berhasil+diperbarui!");
            exit;
        } else {
            header("Location: admin.php?page=pengaturan&status=error&msg=Firebase+belum+dikonfigurasi.");
            exit;
        }
    }
}

// ==========================================
// GET ACTION ROUTERS (DELETION HANDLERS)
// ==========================================
if ($action === 'delete_anggota' && !empty($id)) {
    if ($firebase_ready) {
        $old_data = firebase_request("anggota/{$id}.json");
        if ($old_data && isset($old_data['foto'])) {
            delete_uploaded_file($old_data['foto'], 'anggota');
        }
        firebase_request("anggota/{$id}.json", 'DELETE');
        header("Location: admin.php?page=anggota&status=success&msg=Anggota+berhasil+dihapus");
        exit;
    } else {
        header("Location: admin.php?page=anggota&status=error&msg=Firebase+belum+dikonfigurasi.");
        exit;
    }
}

if ($action === 'delete_proker' && !empty($id)) {
    if ($firebase_ready) {
        firebase_request("program_kerja/{$id}.json", 'DELETE');
        header("Location: admin.php?page=proker&status=success&msg=Program+kerja+berhasil+dihapus");
        exit;
    } else {
        header("Location: admin.php?page=proker&status=error&msg=Firebase+belum+dikonfigurasi.");
        exit;
    }
}

if ($action === 'delete_galeri' && !empty($id)) {
    if ($firebase_ready) {
        $old_data = firebase_request("galeri/{$id}.json");
        if ($old_data && isset($old_data['foto'])) {
            delete_uploaded_file($old_data['foto'], 'galeri');
        }
        firebase_request("galeri/{$id}.json", 'DELETE');
        header("Location: admin.php?page=galeri&status=success&msg=Dokumentasi+galeri+dihapus");
        exit;
    } else {
        header("Location: admin.php?page=galeri&status=error&msg=Firebase+belum+dikonfigurasi.");
        exit;
    }
}

if ($action === 'delete_berita' && !empty($id)) {
    if ($firebase_ready) {
        $old_data = firebase_request("berita/{$id}.json");
        if ($old_data && isset($old_data['foto'])) {
            delete_uploaded_file($old_data['foto'], 'berita');
        }
        firebase_request("berita/{$id}.json", 'DELETE');
        header("Location: admin.php?page=berita&status=success&msg=Berita+laporan+berhasil+dihapus");
        exit;
    } else {
        header("Location: admin.php?page=berita&status=error&msg=Firebase+belum+dikonfigurasi.");
        exit;
    }
}

if ($action === 'delete_pesan' && !empty($id)) {
    if ($firebase_ready) {
        firebase_request("pesan/{$id}.json", 'DELETE');
        header("Location: admin.php?page=pesan&status=success&msg=Pesan+kontak+dihapus");
        exit;
    } else {
        header("Location: admin.php?page=pesan&status=error&msg=Firebase+belum+dikonfigurasi.");
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin KKN 124 Desa Bojong</title>
    
    <!-- Favicon -->
    <link rel="shortcut icon" href="https://uinsaizu.ac.id/wp-content/uploads/2021/04/cropped-Logo-UIN-SAIZU-192x192.png" type="image/x-icon">
    
    <!-- Google Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    
    <!-- Custom styling inside admin page -->
    <style>
        :root {
            --primary: #0f766e;
            --primary-dark: #0f172a;
            --primary-light: #14b8a6;
            --accent: #f59e0b;
            --bg-body: #f1f5f9;
            --sidebar-width: 260px;
            --radius-md: 12px;
            --radius-sm: 8px;
            --transition-smooth: all 0.3s ease;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-body);
            color: #1e293b;
            display: flex;
            min-height: 100vh;
        }

        /* SIDEBAR STYLING */
        .sidebar {
            width: var(--sidebar-width);
            background-color: var(--primary-dark);
            color: #fff;
            padding: 30px 20px;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            left: 0;
            top: 0;
            z-index: 100;
        }

        .sidebar-brand {
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 800;
            color: #fff;
            margin-bottom: 40px;
            padding-left: 10px;
        }

        .sidebar-brand span {
            color: var(--accent);
        }

        .sidebar-menu {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .sidebar-menu a {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            border-radius: var(--radius-sm);
            font-weight: 600;
            font-size: 0.95rem;
            transition: var(--transition-smooth);
        }

        .sidebar-menu a:hover,
        .sidebar-menu li.active a {
            background-color: rgba(255, 255, 255, 0.08);
            color: #fff;
        }

        .sidebar-menu li.active a {
            border-left: 4px solid var(--accent);
            background-color: rgba(15, 118, 110, 0.2);
            color: var(--primary-light);
        }

        .logout-btn {
            margin-top: auto;
            background-color: rgba(239, 68, 68, 0.15) !important;
            color: #ef4444 !important;
        }

        .logout-btn:hover {
            background-color: #ef4444 !important;
            color: #fff !important;
        }

        /* MAIN CONTENT STYLING */
        .main-wrapper {
            margin-left: var(--sidebar-width);
            flex-grow: 1;
            padding: 40px;
            min-height: 100vh;
            width: calc(100% - var(--sidebar-width));
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #cbd5e1;
        }

        .header-title h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            color: var(--primary-dark);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: var(--transition-smooth);
            text-decoration: none;
            font-family: inherit;
        }

        .btn-primary { background-color: var(--primary); color: #fff; }
        .btn-primary:hover { background-color: #0d9488; }
        .btn-accent { background-color: var(--accent); color: #fff; }
        .btn-accent:hover { background-color: #d97706; }
        .btn-danger { background-color: #ef4444; color: #fff; }
        .btn-danger:hover { background-color: #dc2626; }
        .btn-secondary { background-color: #cbd5e1; color: #334155; }
        .btn-secondary:hover { background-color: #94a3b8; }

        /* NOTIFICATIONS */
        .alert {
            padding: 15px 20px;
            border-radius: var(--radius-sm);
            margin-bottom: 30px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .alert-success {
            background-color: #dcfce7;
            border-left: 5px solid #22c55e;
            color: #15803d;
        }

        .alert-error {
            background-color: #fee2e2;
            border-left: 5px solid #ef4444;
            color: #b91c1c;
        }

        /* CARDS GRID FOR OVERVIEW */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }

        .stat-card {
            background-color: #fff;
            padding: 24px;
            border-radius: var(--radius-md);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: var(--radius-sm);
            background-color: rgba(15, 118, 110, 0.1);
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .stat-info h3 {
            font-size: 1.8rem;
            color: var(--primary-dark);
            line-height: 1.2;
        }

        .stat-info p {
            font-size: 0.85rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
        }

        /* DATA PANEL / TABLES */
        .data-panel {
            background-color: #fff;
            padding: 30px;
            border-radius: var(--radius-md);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            margin-bottom: 40px;
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .panel-header h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            color: var(--primary-dark);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            margin-bottom: 20px;
        }

        th, td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.95rem;
        }

        th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
        }

        td {
            color: #334155;
            vertical-align: middle;
        }

        /* BADGES */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-green { background-color: #dcfce7; color: #15803d; }
        .badge-blue { background-color: #dbeafe; color: #1d4ed8; }
        .badge-orange { background-color: #ffedd5; color: #b45309; }

        /* FORM FIELD DESIGN */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group-full {
            grid-column: span 2;
        }

        .form-label {
            display: block;
            font-size: 0.9rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 8px;
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #cbd5e1;
            border-radius: var(--radius-sm);
            font-size: 0.95rem;
            font-family: inherit;
            color: #1e293b;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
        }

        textarea.form-control {
            min-height: 120px;
            resize: vertical;
        }

        .actions-cell {
            display: flex;
            gap: 8px;
        }

        .action-link {
            padding: 6px 12px;
            font-size: 0.8rem;
            border-radius: var(--radius-sm);
            text-decoration: none;
            font-weight: 600;
        }
        .action-edit { background-color: rgba(245,158,11,0.1); color: #d97706; }
        .action-edit:hover { background-color: var(--accent); color: #fff; }
        .action-delete { background-color: rgba(239,68,68,0.1); color: #ef4444; }
        .action-delete:hover { background-color: #ef4444; color: #fff; }

        /* RESPONSIVE DESIGN */
        @media (max-width: 992px) {
            body {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
                padding: 20px;
            }
            .sidebar-brand {
                margin-bottom: 20px;
            }
            .sidebar-menu {
                flex-direction: row;
                flex-wrap: wrap;
            }
            .main-wrapper {
                margin-left: 0;
                width: 100%;
                padding: 24px;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
            .form-group-full {
                grid-column: span 1;
            }
        }
        
        /* PASSWORD TOGGLE STYLES */
        .password-toggle-container {
            position: relative;
        }
        .password-toggle-btn {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            transition: color 0.2s;
            z-index: 10;
        }
        .password-toggle-btn:hover {
            color: var(--primary) !important;
        }
    </style>
</head>
<body>

    <!-- ======================================================
         SIDEBAR NAVIGATION
         ====================================================== -->
    <div class="sidebar">
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 16px; padding: 0 10px;">
            <img src="assets/img/logo-KKN-124.png" alt="Logo KKN 124" style="height: 42px; width: auto; object-fit: contain; filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            <img src="assets/img/logo-kkn-angkatan-58.png" alt="Logo KKN 58" style="height: 42px; width: auto; object-fit: contain; filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        </div>
        <div class="sidebar-brand">PANEL <span>ADMIN</span></div>
        <ul class="sidebar-menu">
            <li class="<?= $page === 'dashboard' ? 'active' : '' ?>">
                <a href="admin.php?page=dashboard"><i class="bi bi-speedometer2"></i> Dashboard</a>
            </li>
            <li class="<?= $page === 'anggota' ? 'active' : '' ?>">
                <a href="admin.php?page=anggota"><i class="bi bi-people-fill"></i> Data Anggota</a>
            </li>
            <li class="<?= $page === 'proker' ? 'active' : '' ?>">
                <a href="admin.php?page=proker"><i class="bi bi-briefcase-fill"></i> Program Kerja</a>
            </li>
            <li class="<?= $page === 'galeri' ? 'active' : '' ?>">
                <a href="admin.php?page=galeri"><i class="bi bi-image"></i> Galeri Dokumentasi</a>
            </li>
            <li class="<?= $page === 'berita' ? 'active' : '' ?>">
                <a href="admin.php?page=berita"><i class="bi bi-newspaper"></i> Berita Kegiatan</a>
            </li>
            <li class="<?= $page === 'pesan' ? 'active' : '' ?>">
                <a href="admin.php?page=pesan"><i class="bi bi-chat-left-text-fill"></i> Pesan Masuk</a>
            </li>
            <li class="<?= $page === 'pengaturan' ? 'active' : '' ?>">
                <a href="admin.php?page=pengaturan"><i class="bi bi-geo-alt-fill"></i> Pengaturan Posko</a>
            </li>
            <li class="<?= $page === 'ganti_sandi' ? 'active' : '' ?>">
                <a href="admin.php?page=ganti_sandi"><i class="bi bi-key-fill"></i> Ganti Sandi</a>
            </li>
            
            <li>
                <a href="logout.php" class="logout-btn"><i class="bi bi-box-arrow-right"></i> Log Out</a>
            </li>
        </ul>
    </div>

    <!-- ======================================================
         MAIN CONTENT WRAPPER
         ====================================================== -->
    <div class="main-wrapper">
        <header>
            <div class="header-title">
                <h1>Sistem Manajemen Website KKN 124</h1>
            </div>
            <div class="header-actions">
                <span>Halo, <strong><?= htmlspecialchars($_SESSION['admin_username']) ?></strong></span>
                <a href="index.php" target="_blank" class="btn btn-secondary"><i class="bi bi-globe"></i> Lihat Website</a>
            </div>
        </header>

        <!-- Feedback Messages -->
        <?php if (!empty($msg)): ?>
            <div class="alert <?= $status === 'success' ? 'alert-success' : 'alert-error' ?>">
                <i class="bi <?= $status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill' ?>"></i>
                <span><?= htmlspecialchars($msg) ?></span>
            </div>
        <?php endif; ?>

        <!-- ======================================================
             TAB: OVERVIEW / DASHBOARD
             ====================================================== -->
        <?php if ($page === 'dashboard'): 
            // Ambil statistik data
            $jml_anggota = count(get_anggota());
            $jml_proker = count(get_program_kerja());
            $jml_galeri = count(get_galeri());
            $jml_berita = count(get_berita());
            
            $jml_pesan = 0;
            if ($firebase_ready) {
                $pesan_res = firebase_request('pesan.json');
                if (is_array($pesan_res)) {
                    $jml_pesan = count($pesan_res);
                }
            }
        ?>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
                    <div class="stat-info">
                        <h3><?= $jml_anggota ?></h3>
                        <p>Anggota KKN</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color: #3b82f6; background-color: rgba(59,130,246,0.1);"><i class="bi bi-briefcase-fill"></i></div>
                    <div class="stat-info">
                        <h3><?= $jml_proker ?></h3>
                        <p>Program Kerja</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color: #eab308; background-color: rgba(234,179,8,0.1);"><i class="bi bi-image"></i></div>
                    <div class="stat-info">
                        <h3><?= $jml_galeri ?></h3>
                        <p>Foto Galeri</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color: #ec4899; background-color: rgba(236,72,153,0.1);"><i class="bi bi-newspaper"></i></div>
                    <div class="stat-info">
                        <h3><?= $jml_berita ?></h3>
                        <p>Artikel Berita</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color: #8b5cf6; background-color: rgba(139,92,246,0.1);"><i class="bi bi-chat-left-text-fill"></i></div>
                    <div class="stat-info">
                        <h3><?= $jml_pesan ?></h3>
                        <p>Pesan Kontak</p>
                    </div>
                </div>
            </div>

            <div class="data-panel">
                <h2>Selamat Datang di Panel Kontrol Admin</h2>
                <p style="margin-top: 15px; color: #475569; line-height: 1.8;">
                    Melalui panel kontrol ini, Anda memiliki kendali penuh terhadap konten yang dipublikasikan pada website utama **KKN 124 Desa Bojong**. Silakan gunakan menu sidebar untuk mengelola database anggota, menyusun program kerja, memperbarui galeri dokumentasi foto, menulis berita/laporan kegiatan terbaru, dan memonitor pesan masuk dari pengunjung website.
                </p>
                <div style="margin-top: 25px; display: flex; gap: 15px;">
                    <a href="admin.php?page=anggota" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Kelola Anggota</a>
                    <a href="admin.php?page=proker" class="btn btn-accent"><i class="bi bi-plus-circle"></i> Susun Proker</a>
                </div>
            </div>

        <!-- ======================================================
             TAB: DATA ANGGOTA (CRUD UI)
             ====================================================== -->
        <?php elseif ($page === 'anggota'): ?>
            
            <?php if ($action === 'add' || $action === 'edit'): 
                $form_action = 'admin.php?action=add_anggota';
                $title_form = 'Tambah Anggota Baru';
                $val_nama = '';
                $val_divisi = '';
                $val_prodi = '';
                $val_urutan = 0;
                $val_foto = '';
                
                if ($action === 'edit') {
                    $form_action = 'admin.php?action=edit_anggota';
                    $title_form = 'Edit Data Anggota';
                    if ($firebase_ready) {
                        $row = firebase_request("anggota/{$id}.json");
                        if (is_array($row)) {
                            $val_nama = $row['nama'];
                            $val_divisi = $row['divisi'];
                            $val_prodi = $row['prodi'];
                            $val_urutan = $row['urutan'];
                            $val_foto = isset($row['foto']) ? $row['foto'] : '';
                        }
                    }
                }
            ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2><?= $title_form ?></h2>
                        <a href="admin.php?page=anggota" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Kembali</a>
                    </div>
                    
                    <form method="POST" action="<?= $form_action ?>" enctype="multipart/form-data">
                        <?php if ($action === 'edit'): ?>
                            <input type="hidden" name="id" value="<?= $id ?>">
                        <?php endif; ?>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="nama" class="form-label">Nama Lengkap</label>
                                <input type="text" id="nama" name="nama" class="form-control" value="<?= htmlspecialchars($val_nama) ?>" required placeholder="Contoh: Budi Gunawan">
                            </div>
                            <div class="form-group">
                                <label for="urutan" class="form-label">Urutan Tampil (Prioritas)</label>
                                <input type="number" id="urutan" name="urutan" class="form-control" value="<?= $val_urutan ?>" required min="0" placeholder="Contoh: 1">
                            </div>
                            <div class="form-group">
                                <label for="divisi" class="form-label">Divisi / Jabatan</label>
                                <input type="text" id="divisi" name="divisi" class="form-control" value="<?= htmlspecialchars($val_divisi) ?>" required placeholder="Contoh: Divisi Keagamaan">
                            </div>
                            <div class="form-group">
                                <label for="prodi" class="form-label">Program Studi</label>
                                <input type="text" id="prodi" name="prodi" class="form-control" value="<?= htmlspecialchars($val_prodi) ?>" required placeholder="Contoh: Pendidikan Agama Islam">
                            </div>
                            <div class="form-group form-group-full">
                                <label for="foto" class="form-label">Foto Profil (Kosongkan jika tidak diubah)</label>
                                <input type="file" id="foto" name="foto" class="form-control" accept="image/*">
                                <?php if (!empty($val_foto)): ?>
                                    <p style="margin-top: 10px; font-size: 0.85rem; color: #475569;">
                                        Foto aktif saat ini: <a href="assets/uploads/anggota/<?= $val_foto ?>" target="_blank"><?= $val_foto ?></a>
                                    </p>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Simpan Data</button>
                    </form>
                </div>
            <?php else: ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2>Daftar Anggota KKN 124</h2>
                        <a href="admin.php?page=anggota&action=add" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Tambah Anggota</a>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 60px;">Urutan</th>
                                    <th>Nama</th>
                                    <th>Divisi/Jabatan</th>
                                    <th>Program Studi</th>
                                    <th style="width: 100px;">Foto</th>
                                    <th style="width: 180px; text-align: center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php 
                                $anggota = get_anggota();
                                if (empty($anggota)):
                                ?>
                                    <tr>
                                        <td colspan="6" style="text-align: center; color: #64748b;">Belum ada data anggota kelompok. Silakan tambahkan!</td>
                                    </tr>
                                <?php 
                                else:
                                    foreach ($anggota as $row): 
                                ?>
                                    <tr>
                                        <td><strong><?= $row['urutan'] ?></strong></td>
                                        <td><strong><?= htmlspecialchars($row['nama']) ?></strong></td>
                                        <td><span class="badge badge-green"><?= htmlspecialchars($row['divisi']) ?></span></td>
                                        <td><?= htmlspecialchars($row['prodi']) ?></td>
                                        <td>
                                            <?php if (!empty($row['foto']) && file_exists('assets/uploads/anggota/' . $row['foto'])): ?>
                                                <img src="assets/uploads/anggota/<?= $row['foto'] ?>" alt="Foto" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">
                                            <?php else: ?>
                                                <div style="width: 44px; height: 44px; border-radius: 50%; background-color: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">
                                                    NA
                                                </div>
                                            <?php endif; ?>
                                        </td>
                                        <td class="actions-cell" style="justify-content: center;">
                                            <a href="admin.php?page=anggota&action=edit&id=<?= $row['id'] ?>" class="action-link action-edit"><i class="bi bi-pencil-square"></i> Edit</a>
                                            <a href="admin.php?action=delete_anggota&id=<?= $row['id'] ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus data anggota ini?')" class="action-link action-delete"><i class="bi bi-trash"></i> Hapus</a>
                                        </td>
                                    </tr>
                                <?php 
                                    endforeach; 
                                endif;
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

        <!-- ======================================================
             TAB: PROGRAM KERJA (CRUD UI)
             ====================================================== -->
        <?php elseif ($page === 'proker'): ?>
            
            <?php if ($action === 'add' || $action === 'edit'): 
                $form_action = 'admin.php?action=add_proker';
                $title_form = 'Tambah Program Kerja';
                $val_nama = '';
                $val_deskripsi = '';
                $val_divisi = '';
                $val_status = 'Terencana';
                $val_icon = 'bi-clipboard';
                
                if ($action === 'edit') {
                    $form_action = 'admin.php?action=edit_proker';
                    $title_form = 'Edit Program Kerja';
                    if ($firebase_ready) {
                        $row = firebase_request("program_kerja/{$id}.json");
                        if (is_array($row)) {
                            $val_nama = $row['nama'];
                            $val_deskripsi = $row['deskripsi'];
                            $val_divisi = $row['divisi_pelaksana'];
                            $val_status = $row['status'];
                            $val_icon = $row['icon'];
                        }
                    }
                }
            ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2><?= $title_form ?></h2>
                        <a href="admin.php?page=proker" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Kembali</a>
                    </div>
                    
                    <form method="POST" action="<?= $form_action ?>">
                        <?php if ($action === 'edit'): ?>
                            <input type="hidden" name="id" value="<?= $id ?>">
                        <?php endif; ?>
                        
                        <div class="form-grid">
                            <div class="form-group form-group-full">
                                <label for="nama" class="form-label">Nama Program Kerja</label>
                                <input type="text" id="nama" name="nama" class="form-control" value="<?= htmlspecialchars($val_nama) ?>" required placeholder="Contoh: Digitalisasi UMKM Bojong">
                            </div>
                            <div class="form-group">
                                <label for="divisi_pelaksana" class="form-label">Divisi Penanggung Jawab</label>
                                <input type="text" id="divisi_pelaksana" name="divisi_pelaksana" class="form-control" value="<?= htmlspecialchars($val_divisi) ?>" required placeholder="Contoh: Divisi Kewirausahaan">
                            </div>
                            <div class="form-group">
                                <label for="status" class="form-label">Status Program</label>
                                <select id="status" name="status" class="form-control">
                                    <option value="Terencana" <?= $val_status === 'Terencana' ? 'selected' : '' ?>>Terencana</option>
                                    <option value="Berjalan" <?= $val_status === 'Berjalan' ? 'selected' : '' ?>>Berjalan</option>
                                    <option value="Selesai" <?= $val_status === 'Selesai' ? 'selected' : '' ?>>Selesai</option>
                                </select>
                            </div>
                            <div class="form-group form-group-full">
                                <label for="icon" class="form-label">Class Icon Bootstrap (Gunakan awalan bi-)</label>
                                <input type="text" id="icon" name="icon" class="form-control" value="<?= htmlspecialchars($val_icon) ?>" required placeholder="Contoh: bi-shop, bi-book, bi-heart-pulse">
                                <span style="font-size: 0.8rem; color: #64748b;">Lihat daftar icon lengkap di <a href="https://icons.getbootstrap.com/" target="_blank">icons.getbootstrap.com</a></span>
                            </div>
                            <div class="form-group form-group-full">
                                <label for="deskripsi" class="form-label">Deskripsi Rincian Program</label>
                                <textarea id="deskripsi" name="deskripsi" class="form-control" required placeholder="Jelaskan mengenai program kerja ini secara mendetail..."><?= htmlspecialchars($val_deskripsi) ?></textarea>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Simpan Data</button>
                    </form>
                </div>
            <?php else: ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2>Daftar Program Kerja KKN 124</h2>
                        <a href="admin.php?page=proker&action=add" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Tambah Proker</a>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50px;">Icon</th>
                                    <th>Nama Program Kerja</th>
                                    <th>Divisi Pelaksana</th>
                                    <th style="width: 120px;">Status</th>
                                    <th style="width: 180px; text-align: center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php 
                                $proker = get_program_kerja();
                                if (empty($proker)):
                                ?>
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: #64748b;">Belum ada program kerja yang ditambahkan.</td>
                                    </tr>
                                <?php 
                                else:
                                    foreach ($proker as $row): 
                                        $status_color = 'badge-orange';
                                        if (strtolower($row['status']) === 'selesai') {
                                            $status_color = 'badge-green';
                                        } elseif (strtolower($row['status']) === 'berjalan') {
                                            $status_color = 'badge-blue';
                                        }
                                ?>
                                    <tr>
                                        <td style="text-align: center; font-size: 1.3rem;"><i class="bi <?= htmlspecialchars($row['icon']) ?>"></i></td>
                                        <td><strong><?= htmlspecialchars($row['nama']) ?></strong></td>
                                        <td><?= htmlspecialchars($row['divisi_pelaksana']) ?></td>
                                        <td><span class="badge <?= $status_color ?>"><?= htmlspecialchars($row['status']) ?></span></td>
                                        <td class="actions-cell" style="justify-content: center;">
                                            <a href="admin.php?page=proker&action=edit&id=<?= $row['id'] ?>" class="action-link action-edit"><i class="bi bi-pencil-square"></i> Edit</a>
                                            <a href="admin.php?action=delete_proker&id=<?= $row['id'] ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus program kerja ini?')" class="action-link action-delete"><i class="bi bi-trash"></i> Hapus</a>
                                        </td>
                                    </tr>
                                <?php 
                                    endforeach; 
                                endif;
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

        <!-- ======================================================
             TAB: DOKUMENTASI GALERI (CRUD UI)
             ====================================================== -->
        <?php elseif ($page === 'galeri'): ?>
            
            <?php if ($action === 'add' || $action === 'edit'): 
                $form_action = 'admin.php?action=add_galeri';
                $title_form = 'Tambah Dokumentasi Baru';
                $val_judul = '';
                $val_deskripsi = '';
                $val_tanggal = date('Y-m-d');
                $val_foto = '';
                
                if ($action === 'edit') {
                    $form_action = 'admin.php?action=edit_galeri';
                    $title_form = 'Edit Dokumentasi Galeri';
                    if ($firebase_ready) {
                        $row = firebase_request("galeri/{$id}.json");
                        if (is_array($row)) {
                            $val_judul = $row['judul'];
                            $val_deskripsi = $row['deskripsi'];
                            $val_tanggal = $row['tanggal'];
                            $val_foto = isset($row['foto']) ? $row['foto'] : '';
                        }
                    }
                }
            ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2><?= $title_form ?></h2>
                        <a href="admin.php?page=galeri" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Kembali</a>
                    </div>
                    
                    <form method="POST" action="<?= $form_action ?>" enctype="multipart/form-data">
                        <?php if ($action === 'edit'): ?>
                            <input type="hidden" name="id" value="<?= $id ?>">
                        <?php endif; ?>
                        
                        <div class="form-grid">
                            <div class="form-group form-group-full">
                                <label for="judul" class="form-label">Judul Dokumentasi Kegiatan</label>
                                <input type="text" id="judul" name="judul" class="form-control" value="<?= htmlspecialchars($val_judul) ?>" required placeholder="Contoh: Rapat dengan Kepala Desa">
                            </div>
                            <div class="form-group">
                                <label for="tanggal" class="form-label">Tanggal Kegiatan</label>
                                <input type="date" id="tanggal" name="tanggal" class="form-control" value="<?= htmlspecialchars($val_tanggal) ?>" required>
                            </div>
                            <div class="form-group">
                                <label for="foto" class="form-label">Unggah Foto (Maks 3MB - JPG, PNG, WEBP)</label>
                                <input type="file" id="foto" name="foto" class="form-control" accept="image/*" <?= $action === 'add' ? 'required' : '' ?>>
                                <?php if (!empty($val_foto)): ?>
                                    <p style="margin-top: 10px; font-size: 0.85rem; color: #475569;">
                                        File saat ini: <a href="assets/uploads/galeri/<?= $val_foto ?>" target="_blank"><?= $val_foto ?></a>
                                    </p>
                                <?php endif; ?>
                            </div>
                            <div class="form-group form-group-full">
                                <label for="deskripsi" class="form-label">Deskripsi Singkat Kegiatan</label>
                                <textarea id="deskripsi" name="deskripsi" class="form-control" placeholder="Jelaskan mengenai detail aktivitas saat pengambilan foto ini..."><?= htmlspecialchars($val_deskripsi) ?></textarea>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Simpan Data</button>
                    </form>
                </div>
            <?php else: ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2>Galeri Dokumentasi Kegiatan KKN</h2>
                        <a href="admin.php?page=galeri&action=add" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Tambah Dokumentasi</a>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 100px;">Foto</th>
                                    <th>Judul Dokumentasi</th>
                                    <th>Tanggal</th>
                                    <th>Deskripsi Singkat</th>
                                    <th style="width: 180px; text-align: center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php 
                                $galeri = get_galeri();
                                if (empty($galeri)):
                                ?>
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: #64748b;">Belum ada dokumentasi foto kegiatan.</td>
                                    </tr>
                                <?php 
                                else:
                                    foreach ($galeri as $row): 
                                ?>
                                    <tr>
                                        <td>
                                            <?php if (!empty($row['foto']) && file_exists('assets/uploads/galeri/' . $row['foto'])): ?>
                                                <img src="assets/uploads/galeri/<?= $row['foto'] ?>" alt="Foto" style="width: 60px; height: 45px; border-radius: var(--radius-sm); object-fit: cover;">
                                            <?php else: ?>
                                                <div style="width: 60px; height: 45px; border-radius: var(--radius-sm); background-color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #64748b;">
                                                    KOSONG
                                                </div>
                                            <?php endif; ?>
                                        </td>
                                        <td><strong><?= htmlspecialchars($row['judul']) ?></strong></td>
                                        <td><?= date('d-m-Y', strtotime($row['tanggal'])) ?></td>
                                        <td>
                                            <span style="font-size: 0.85rem; color: #64748b;">
                                                <?= strlen($row['deskripsi']) > 60 ? htmlspecialchars(substr($row['deskripsi'], 0, 60)) . '...' : htmlspecialchars($row['deskripsi']) ?>
                                            </span>
                                        </td>
                                        <td class="actions-cell" style="justify-content: center;">
                                            <a href="admin.php?page=galeri&action=edit&id=<?= $row['id'] ?>" class="action-link action-edit"><i class="bi bi-pencil-square"></i> Edit</a>
                                            <a href="admin.php?action=delete_galeri&id=<?= $row['id'] ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus dokumentasi galeri ini?')" class="action-link action-delete"><i class="bi bi-trash"></i> Hapus</a>
                                        </td>
                                    </tr>
                                <?php 
                                    endforeach; 
                                endif;
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

        <!-- ======================================================
             TAB: BERITA / LAPORAN KEGIATAN (CRUD UI)
             ====================================================== -->
        <?php elseif ($page === 'berita'): ?>
            
            <?php if ($action === 'add' || $action === 'edit'): 
                $form_action = 'admin.php?action=add_berita';
                $title_form = 'Tulis Berita / Laporan Baru';
                $val_judul = '';
                $val_konten = '';
                $val_penulis = $_SESSION['admin_username'];
                $val_foto = '';
                
                if ($action === 'edit') {
                    $form_action = 'admin.php?action=edit_berita';
                    $title_form = 'Edit Artikel Berita';
                    if ($firebase_ready) {
                        $row = firebase_request("berita/{$id}.json");
                        if (is_array($row)) {
                            $val_judul = $row['judul'];
                            $val_konten = $row['konten'];
                            $val_penulis = $row['penulis'];
                            $val_foto = isset($row['foto']) ? $row['foto'] : '';
                        }
                    }
                }
            ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2><?= $title_form ?></h2>
                        <a href="admin.php?page=berita" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Kembali</a>
                    </div>
                    
                    <form method="POST" action="<?= $form_action ?>" enctype="multipart/form-data">
                        <?php if ($action === 'edit'): ?>
                            <input type="hidden" name="id" value="<?= $id ?>">
                        <?php endif; ?>
                        
                        <div class="form-grid">
                            <div class="form-group form-group-full">
                                <label for="judul" class="form-label">Judul Artikel Berita</label>
                                <input type="text" id="judul" name="judul" class="form-control" value="<?= htmlspecialchars($val_judul) ?>" required placeholder="Masukkan judul yang menarik...">
                            </div>
                            <div class="form-group">
                                <label for="penulis" class="form-label">Penulis / Kontributor</label>
                                <input type="text" id="penulis" name="penulis" class="form-control" value="<?= htmlspecialchars($val_penulis) ?>" required placeholder="Nama penulis">
                            </div>
                            <div class="form-group">
                                <label for="foto" class="form-label">Unggah Foto Cover (JPG, PNG, WEBP)</label>
                                <input type="file" id="foto" name="foto" class="form-control" accept="image/*">
                                <?php if (!empty($val_foto)): ?>
                                    <p style="margin-top: 10px; font-size: 0.85rem; color: #475569;">
                                        Foto aktif: <a href="assets/uploads/berita/<?= $val_foto ?>" target="_blank"><?= $val_foto ?></a>
                                    </p>
                                <?php endif; ?>
                            </div>
                            <div class="form-group form-group-full">
                                <label for="konten" class="form-label">Isi Konten Berita Lengkap</label>
                                <textarea id="konten" name="konten" class="form-control" style="min-height: 250px;" required placeholder="Tuliskan berita secara lengkap di sini..."><?= htmlspecialchars($val_konten) ?></textarea>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Terbitkan Berita</button>
                    </form>
                </div>
            <?php else: ?>
                <div class="data-panel">
                    <div class="panel-header">
                        <h2>Manajer Berita & Laporan Kegiatan</h2>
                        <a href="admin.php?page=berita&action=add" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Tulis Berita</a>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 100px;">Cover</th>
                                    <th>Judul Berita</th>
                                    <th>Penulis</th>
                                    <th>Tanggal Rilis</th>
                                    <th style="width: 180px; text-align: center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php 
                                $berita = get_berita();
                                if (empty($berita)):
                                ?>
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: #64748b;">Belum ada berita kegiatan yang diterbitkan.</td>
                                    </tr>
                                <?php 
                                else:
                                    foreach ($berita as $row): 
                                ?>
                                    <tr>
                                        <td>
                                            <?php if (!empty($row['foto']) && file_exists('assets/uploads/berita/' . $row['foto'])): ?>
                                                <img src="assets/uploads/berita/<?= $row['foto'] ?>" alt="Cover" style="width: 60px; height: 45px; border-radius: var(--radius-sm); object-fit: cover;">
                                            <?php else: ?>
                                                <div style="width: 60px; height: 45px; border-radius: var(--radius-sm); background-color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #64748b;">
                                                    KOSONG
                                                </div>
                                            <?php endif; ?>
                                        </td>
                                        <td><strong><?= htmlspecialchars($row['judul']) ?></strong></td>
                                        <td><?= htmlspecialchars($row['penulis']) ?></td>
                                        <td><?= date('d-m-Y H:i', strtotime($row['tanggal'])) ?></td>
                                        <td class="actions-cell" style="justify-content: center;">
                                            <a href="admin.php?page=berita&action=edit&id=<?= $row['id'] ?>" class="action-link action-edit"><i class="bi bi-pencil-square"></i> Edit</a>
                                            <a href="admin.php?action=delete_berita&id=<?= $row['id'] ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus artikel berita ini?')" class="action-link action-delete"><i class="bi bi-trash"></i> Hapus</a>
                                        </td>
                                    </tr>
                                <?php 
                                    endforeach; 
                                endif;
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

        <!-- ======================================================
             TAB: PESAN MASUK DARI PENGUNJUNG
             ====================================================== -->
        <?php elseif ($page === 'pesan'): ?>
            <div class="data-panel">
                <div class="panel-header">
                    <h2>Pesan Hubungi Kami dari Pengunjung</h2>
                </div>
                
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 150px;">Pengirim</th>
                                <th>Email</th>
                                <th>Subjek</th>
                                <th>Pesan</th>
                                <th style="width: 140px;">Tanggal Masuk</th>
                                <th style="width: 100px; text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            if ($firebase_ready) {
                                $pesan_res = firebase_request('pesan.json');
                                if (is_array($pesan_res) && !empty($pesan_res)):
                                    $pesan_list = [];
                                    foreach ($pesan_res as $k => $v) {
                                        $v['id'] = $k;
                                        $pesan_list[] = $v;
                                    }
                                    usort($pesan_list, function($a, $b) {
                                        $ta = isset($a['tanggal']) ? $a['tanggal'] : '';
                                        $tb = isset($b['tanggal']) ? $b['tanggal'] : '';
                                        return strcmp($tb, $ta);
                                    });
                                    foreach ($pesan_list as $row):
                            ?>
                                <tr>
                                    <td><strong><?= htmlspecialchars($row['nama']) ?></strong></td>
                                    <td><a href="mailto:<?= htmlspecialchars($row['email']) ?>" style="color: var(--primary); text-decoration: underline; font-size: 0.85rem;"><?= htmlspecialchars($row['email']) ?></a></td>
                                    <td><strong><?= htmlspecialchars($row['subjek']) ?></strong></td>
                                    <td><p style="font-size: 0.85rem; color: #475569; max-width: 320px; white-space: pre-line;"><?= htmlspecialchars($row['pesan']) ?></p></td>
                                    <td style="font-size: 0.8rem;"><?= date('d-m-Y H:i', strtotime($row['tanggal'])) ?></td>
                                    <td style="text-align: center;">
                                        <a href="admin.php?action=delete_pesan&id=<?= $row['id'] ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus pesan masuk ini?')" class="action-link action-delete"><i class="bi bi-trash"></i> Hapus</a>
                                    </td>
                                </tr>
                            <?php 
                                    endforeach;
                                else:
                            ?>
                                <tr>
                                    <td colspan="6" style="text-align: center; color: #64748b;">Belum ada pesan masuk dari pengunjung website.</td>
                                </tr>
                            <?php 
                                endif;
                            } else {
                            ?>
                                <tr>
                                    <td colspan="6" style="text-align: center; color: #ef4444;">Firebase belum dikonfigurasi untuk melihat pesan.</td>
                                </tr>
                            <?php 
                            } 
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>

        <!-- ======================================================
             TAB: PENGATURAN POSKO & LOKASI
             ====================================================== -->
        <?php elseif ($page === 'pengaturan'): 
            $settings = get_settings();
        ?>
            <div class="data-panel" style="max-width: 800px;">
                <div class="panel-header">
                    <h2>Pengaturan Posko & Identitas Kegiatan</h2>
                </div>
                
                <form method="POST" action="admin.php?action=edit_pengaturan">
                    <div class="form-grid">
                        <div class="form-group form-group-full">
                            <label for="alamat_posko" class="form-label">Alamat Lengkap Posko</label>
                            <input type="text" id="alamat_posko" name="alamat_posko" class="form-control" value="<?= htmlspecialchars($settings['alamat_posko']) ?>" required placeholder="Contoh: Jln. Raya Parigi No. 10...">
                        </div>
                        
                        <div class="form-group form-group-full">
                            <label for="map_embed" class="form-label">Google Maps Embed URL / Iframe Code</label>
                            <textarea id="map_embed" name="map_embed" class="form-control" required style="min-height: 100px;" placeholder="Masukkan URL Embed Google Maps (misal https://www.google.com/maps/embed?...) atau seluruh kode iframe."><?= htmlspecialchars($settings['map_embed']) ?></textarea>
                            <span style="font-size: 0.8rem; color: #64748b;">
                                Tips: Buka Google Maps, cari lokasi posko, klik <strong>Share / Bagikan</strong> → <strong>Embed a map / Sematkan peta</strong> → Copy link atau copy kode HTML lalu paste di atas.
                            </span>
                        </div>
                        
                        <div class="form-group">
                            <label for="email" class="form-label">Email Resmi</label>
                            <input type="email" id="email" name="email" class="form-control" value="<?= htmlspecialchars($settings['email']) ?>" required placeholder="Contoh: kkn@university.ac.id">
                        </div>
                        
                        <div class="form-group">
                            <label for="whatsapp" class="form-label">WhatsApp Posko</label>
                            <input type="text" id="whatsapp" name="whatsapp" class="form-control" value="<?= htmlspecialchars($settings['whatsapp']) ?>" required placeholder="Contoh: +62 812-3456-7890">
                        </div>
                        
                        <div class="form-group">
                            <label for="instagram" class="form-label">Instagram Resmi</label>
                            <input type="text" id="instagram" name="instagram" class="form-control" value="<?= htmlspecialchars($settings['instagram']) ?>" required placeholder="Contoh: @diary.bojong124">
                        </div>
                        
                        <div class="form-group">
                            <label for="hari_pengabdian" class="form-label">Jumlah Hari Pengabdian</label>
                            <input type="number" id="hari_pengabdian" name="hari_pengabdian" class="form-control" value="<?= htmlspecialchars($settings['hari_pengabdian']) ?>" required min="1" placeholder="Contoh: 40">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Simpan Pengaturan</button>
                </form>
            </div>

        <!-- ======================================================
             TAB: GANTI SANDI ADMIN
             ====================================================== -->
        <?php elseif ($page === 'ganti_sandi'): ?>
            <div class="data-panel" style="max-width: 600px;">
                <div class="panel-header">
                    <h2>Ganti Sandi Administrator</h2>
                </div>
                
                <form method="POST" action="admin.php?action=ganti_sandi">
                    <div class="form-group">
                        <label for="password_lama" class="form-label">Sandi Lama</label>
                        <div class="password-toggle-container">
                            <input type="password" id="password_lama" name="password_lama" class="form-control" placeholder="Masukkan kata sandi lama Anda" required autocomplete="current-password" style="padding-right: 45px;">
                            <button type="button" class="password-toggle-btn toggle-password-btn" data-target="password_lama">
                                <i class="bi bi-eye-slash" id="eye-icon-password_lama"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="password_baru" class="form-label">Sandi Baru (Minimal 6 karakter)</label>
                        <div class="password-toggle-container">
                            <input type="password" id="password_baru" name="password_baru" class="form-control" placeholder="Masukkan kata sandi baru" required autocomplete="new-password" style="padding-right: 45px;">
                            <button type="button" class="password-toggle-btn toggle-password-btn" data-target="password_baru">
                                <i class="bi bi-eye-slash" id="eye-icon-password_baru"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="konfirmasi_password" class="form-label">Konfirmasi Sandi Baru</label>
                        <div class="password-toggle-container">
                            <input type="password" id="konfirmasi_password" name="konfirmasi_password" class="form-control" placeholder="Ketik ulang kata sandi baru" required autocomplete="new-password" style="padding-right: 45px;">
                            <button type="button" class="password-toggle-btn toggle-password-btn" data-target="konfirmasi_password">
                                <i class="bi bi-eye-slash" id="eye-icon-konfirmasi_password"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-shield-lock-fill"></i> Simpan Perubahan</button>
                    </div>
                </form>
            </div>

        <?php endif; ?>
    </div>

    <script>
        // Password toggler script for admin change password fields
        document.querySelectorAll('.toggle-password-btn').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = document.getElementById('eye-icon-' + targetId);
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                }
            });
        });
    </script>
</body>
</html>
