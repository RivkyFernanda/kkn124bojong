"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  
  // Contact details state from Firestore config
  const [socials, setSocials] = useState({
    email: "kkn124bojong@gmail.com",
    tiktok: "kkn124bojong",
    instagram: "kkn124bojong"
  });

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    subjek: "",
    pesan: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch KKN socials config from Firestore
  useEffect(() => {
    async function fetchSocials() {
      try {
        const docRef = doc(db, "config", "kontak");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSocials(docSnap.data());
        }
      } catch (err) {
        // Fallback to default
      }
    }
    fetchSocials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.nama.trim() || !formData.email.trim() || !formData.subjek.trim() || !formData.pesan.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "pesan"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ nama: "", email: "", subjek: "", pesan: "" });
    } catch (err) {
      setError("Gagal mengirim pesan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="kontak" className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div className={styles.brandCol}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>
                  <img src="/image/logo-KKN-124.png" alt="Logo KKN 124" className={styles.brandLogo} />
                </div>
                <div>
                  <div className={styles.brandName}>KKN 124 Desa Bojong</div>
                  <div className={styles.brandSub}>UIN Saizu Purwokerto</div>
                </div>
              </div>
              <p className={styles.brandDesc}>
                Kelompok 124 KKN UIN Saizu Purwokerto Angkatan 58 — mengabdi
                dan berkontribusi untuk kemajuan Desa Bojong, Kecamatan Parigi,
                Kabupaten Pangandaran.
              </p>
              <div className={styles.socialLinks}>
                {socials.instagram && (
                  <a
                    href={`https://instagram.com/${socials.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="Instagram KKN 124"
                  >
                    <span>�</span>
                  </a>
                )}
                {socials.tiktok && (
                  <a
                    href={`https://tiktok.com/@${socials.tiktok.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="TikTok KKN 124"
                  >
                    <span>🎵</span>
                  </a>
                )}
                {socials.email && (
                  <a
                    href={`mailto:${socials.email}`}
                    className={styles.socialBtn}
                    aria-label="Email KKN 124"
                  >
                    <span>✉️</span>
                  </a>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className={styles.contactCol}>
              <h3 className={styles.colTitle}>Kontak & Lokasi</h3>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📍</span>
                  <div>
                    <strong>Alamat</strong>
                    <p>Desa Bojong, Kecamatan Parigi,<br />Kabupaten Pangandaran,<br />Jawa Barat</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>🏫</span>
                  <div>
                    <strong>Universitas</strong>
                    <p>UIN Prof. K.H. Saifuddin Zuhri<br />Purwokerto</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>✉️</span>
                  <div>
                    <strong>Email KKN</strong>
                    <p>{socials.email || "kkn124bojong@gmail.com"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Kirim Pesan */}
            <div className={styles.infoCol}>
              <h3 className={styles.colTitle}>Kirim Pesan</h3>
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                {success && (
                  <div className={styles.alertSuccess}>
                    ✅ Pesan berhasil dikirim!
                  </div>
                )}
                {error && (
                  <div className={styles.alertError}>
                    ❌ {error}
                  </div>
                )}
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="nama"
                    placeholder="Nama Lengkap"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Alamat Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="subjek"
                    placeholder="Subjek Pesan"
                    value={formData.subjek}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <textarea
                    name="pesan"
                    placeholder="Tulis pesan Anda..."
                    rows="3"
                    value={formData.pesan}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.btnSubmit}
                >
                  {loading ? "Mengirim..." : "Kirim Pesan ✉️"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <div className={styles.container}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {year} KKN Kelompok 124 · UIN Saizu Purwokerto Angkatan 58 · Desa Bojong
            </p>
            <p className={styles.madeWith}>
              Dibuat dengan 💚 untuk Desa Bojong
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
