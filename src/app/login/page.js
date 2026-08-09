"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.css";



export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      const messages = {
        "auth/user-not-found": "Email tidak terdaftar.",
        "auth/wrong-password": "Password salah. Coba lagi.",
        "auth/invalid-credential": "Email atau password salah.",
        "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
        "auth/invalid-email": "Format email tidak valid.",
      };
      setError(messages[err.code] || "Login gagal. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Background */}
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />
      <div className={styles.bgGrid} />

      {/* Back Link */}
      <a href="/" className={styles.backLink}>
        ← Kembali ke Beranda
      </a>

      <div className={styles.loginBox}>
        {/* Header */}
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>
            <span>🌿</span>
          </div>
          <h1 className={styles.loginTitle}>Login Admin</h1>
          <p className={styles.loginSubtitle}>
            Masuk ke panel pengelola website<br />
            KKN 124 Desa Bojong
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.loginForm} noValidate>
          {/* Error Alert */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Admin</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="admin@desa-bojong.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className={styles.input}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="btn-login-submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Memverifikasi...
              </>
            ) : (
              <>
                <span>🔐</span>
                Masuk ke Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className={styles.loginNote}>
          Hanya admin yang berwenang yang dapat mengakses panel ini.
        </p>
      </div>
    </div>
  );
}
