<?php
// login.php
// Halaman Login Admin KKN 124 Desa Bojong
require_once 'config.php';

// Jika admin sudah login, langsung alihkan ke dashboard admin.php
if (is_admin_logged_in()) {
    header('Location: admin.php');
    exit;
}

$error_msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username_input = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    if (empty($username_input) || empty($password)) {
        $error_msg = 'Username dan Password wajib diisi!';
    } else {
        $email = $username_input;
        // Backward-compatibility: jika user mengetik username biasa (bukan email), otomatis tambahkan domain virtual
        if (strpos($email, '@') === false) {
            $email = $username_input . '@kkn124bojong.com';
        }

        if ($firebase_ready) {
            $url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" . $firebase_api_key;
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $payload = json_encode([
                'email' => $email,
                'password' => $password,
                'returnSecureToken' => true
            ]);
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            $res_data = json_decode($response, true);
            
            if ($http_code === 200 && isset($res_data['idToken'])) {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_username'] = $username_input;
                $_SESSION['firebase_token'] = $res_data['idToken'];
                $_SESSION['firebase_email'] = $res_data['email'];
                $_SESSION['firebase_local_id'] = $res_data['localId'];
                
                header('Location: admin.php');
                exit;
            } else {
                $error_msg = "Username / password salah atau terjadi kesalahan autentikasi.";
                if (isset($res_data['error']['message'])) {
                    $fb_error = $res_data['error']['message'];
                    if ($fb_error === 'EMAIL_NOT_FOUND' || $fb_error === 'INVALID_LOGIN_CREDENTIALS' || $fb_error === 'INVALID_PASSWORD') {
                        $error_msg = "Username atau password yang Anda masukkan salah.";
                    } else if ($fb_error === 'USER_DISABLED') {
                        $error_msg = "Akun administrator ini telah dinonaktifkan.";
                    }
                }
            }
        } else {
            // Demo Fallback jika Firebase belum dikonfigurasi di config.php
            if ($username_input === 'admin' && $password === 'admin123') {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_username'] = 'admin';
                $_SESSION['firebase_token'] = 'demo_token';
                header('Location: admin.php');
                exit;
            } else {
                $error_msg = "Firebase belum dikonfigurasi. Silakan selesaikan setup sesuai PANDUAN_FIREBASE.md.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin - KKN 124 Desa Bojong</title>
    
    <!-- Favicon -->
    <link rel="shortcut icon" href="https://uinsaizu.ac.id/wp-content/uploads/2021/04/cropped-Logo-UIN-SAIZU-192x192.png" type="image/x-icon">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    
    <!-- CSS Embed/Link -->
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body {
            background: linear-gradient(rgba(7, 53, 48, 0.85), rgba(15, 23, 42, 0.92)),
                        url('assets/img/background.jpeg') no-repeat center center;
            background-size: cover;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-container {
            width: 100%;
            max-width: 420px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(16px);
            border-radius: var(--radius-md);
            padding: 40px 30px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.4);
            color: #fff;
            text-align: center;
        }
        .login-logo {
            font-family: var(--font-heading);
            font-size: 1.8rem;
            font-weight: 800;
            color: #fff;
            margin-bottom: 5px;
        }
        .login-logo span {
            color: var(--accent);
        }
        .login-subtitle {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 30px;
        }
        .login-alert {
            background-color: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.4);
            color: #fca5a5;
            padding: 12px;
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            margin-bottom: 20px;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .btn-login {
            background: var(--accent-gradient);
            color: #fff;
            width: 100%;
            padding: 14px;
            border-radius: var(--radius-sm);
            margin-top: 10px;
        }
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
        }
        .back-to-home {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 25px;
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.5);
            transition: var(--transition-fast);
        }
        .back-to-home:hover {
            color: var(--accent);
        }
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
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: color 0.2s;
            z-index: 10;
        }
        .password-toggle-btn:hover {
            color: var(--accent) !important;
        }
    </style>
</head>
<body>

    <div class="login-container">
        <!-- Logo berdampingan di atas form -->
        <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="assets/img/logo-KKN-124.png" alt="Logo KKN 124" style="height: 56px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
            <img src="assets/img/logo-kkn-angkatan-58.png" alt="Logo KKN 58" style="height: 56px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
        </div>
        <div class="login-logo">PANEL <span>ADMIN</span></div>
        <p class="login-subtitle">KKN 124 Desa Bojong - Parigi</p>
        
        <?php if (!empty($error_msg)): ?>
            <div class="login-alert">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span><?= htmlspecialchars($error_msg) ?></span>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <div class="form-group" style="text-align: left;">
                <label for="username" class="form-label">Username</label>
                <input type="text" id="username" name="username" class="form-control" placeholder="Masukkan username admin" required autocomplete="username">
            </div>
            <div class="form-group" style="text-align: left;">
                <label for="password" class="form-label">Password</label>
                <div class="password-toggle-container">
                    <input type="password" id="password" name="password" class="form-control" placeholder="Masukkan password" required autocomplete="current-password" style="padding-right: 45px;">
                    <button type="button" id="toggle-password" class="password-toggle-btn" title="Lihat/Sembunyikan Sandi">
                        <i class="bi bi-eye-slash" id="toggle-password-icon"></i>
                    </button>
                </div>
            </div>
            
            <button type="submit" class="btn btn-login">
                <span>Sign In <i class="bi bi-box-arrow-in-right"></i></span>
            </button>
        </form>
        
        <a href="index.php" class="back-to-home">
            <i class="bi bi-arrow-left"></i> Kembali ke Website Utama
        </a>
    </div>

    <script>
        document.getElementById('toggle-password').addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = document.getElementById('toggle-password-icon');
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
    </script>
</body>
</html>
