import { auth } from './firebase.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// DOM Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorAlert = document.getElementById('login-error-alert');
const errorMsg = document.getElementById('login-error-msg');
const togglePasswordBtn = document.getElementById('toggle-password');
const togglePasswordIcon = document.getElementById('toggle-password-icon');

// Redirect if already logged in (using sessionStorage check for safety)
auth.onAuthStateChanged(user => {
    if (user && sessionStorage.getItem('admin_session_active')) {
        window.location.href = 'admin.html';
    }
});

// Toggle password view
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordIcon.classList.remove('bi-eye-slash');
            togglePasswordIcon.classList.add('bi-eye');
        } else {
            passwordInput.type = 'password';
            togglePasswordIcon.classList.remove('bi-eye');
            togglePasswordIcon.classList.add('bi-eye-slash');
        }
    });
}

// Form submit handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI states
        loginBtn.disabled = true;
        const btnSpan = loginBtn.querySelector('span');
        btnSpan.innerHTML = `Signing In... <i class="bi bi-hourglass-split"></i>`;
        
        errorAlert.style.display = 'none';
        errorMsg.textContent = '';
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // virtual email parsing
        let email = username;
        if (!email.includes('@')) {
            email = username + '@kkn124bojong.com';
        }
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Set sessionStorage flag (so closing browser requires login again)
            sessionStorage.setItem('admin_session_active', 'true');
            
            // Redirect
            window.location.href = 'admin.html';
        } catch (error) {
            console.error(error);
            errorAlert.style.display = 'flex';
            
            let message = "Username atau password yang Anda masukkan salah.";
            const errorCode = error.code;
            
            if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                message = "Username atau password yang Anda masukkan salah.";
            } else if (errorCode === 'auth/user-disabled') {
                message = "Akun administrator ini telah dinonaktifkan.";
            } else if (errorCode === 'auth/too-many-requests') {
                message = "Terlalu banyak percobaan gagal. Akses diblokir sementara. Silakan coba sesaat lagi.";
            } else {
                message = "Gagal login. Pastikan koneksi internet terhubung dan Firebase siap.";
            }
            
            errorMsg.textContent = message;
            
            // Reset button
            btnSpan.innerHTML = `Sign In <i class="bi bi-box-arrow-in-right"></i>`;
            loginBtn.disabled = false;
        }
    });
}
