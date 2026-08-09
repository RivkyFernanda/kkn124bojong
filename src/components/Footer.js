import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "#beranda", label: "Beranda" },
    { href: "#profil", label: "Profil Desa" },
    { href: "#wisata", label: "Wisata" },
    { href: "#umkm", label: "UMKM" },
    { href: "#galeri", label: "Galeri" },
  ];

  return (
    <footer id="kontak" className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div className={styles.brandCol}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>🌿</div>
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
                <a href="#" className={styles.socialBtn} aria-label="Instagram KKN 124">
                  <span>📸</span>
                </a>
                <a href="#" className={styles.socialBtn} aria-label="YouTube KKN 124">
                  <span>▶️</span>
                </a>
                <a href="#" className={styles.socialBtn} aria-label="WhatsApp KKN 124">
                  <span>💬</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.linksCol}>
              <h3 className={styles.colTitle}>Navigasi Cepat</h3>
              <ul className={styles.linkList}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.footerLink}>
                      <span className={styles.linkArrow}>→</span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
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
                  <span className={styles.contactIcon}>🏄‍♂️</span>
                  <div>
                    <strong>Wisata Unggulan</strong>
                    <p>Citumang Body Rafting<br />Parigi, Pangandaran</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className={styles.infoCol}>
              <h3 className={styles.colTitle}>Info UMKM Unggulan</h3>
              <div className={styles.umkmList}>
                {[
                  { icon: "⚔️", name: "Kerajinan Golok" },
                  { icon: "🥁", name: "Gendang Tradisional" },
                  { icon: "🎭", name: "Wayang Golek" },
                  { icon: "🥮", name: "Opak Khas Bojong" },
                  { icon: "🍌", name: "Seriping Pisang" },
                  { icon: "🧺", name: "Kerajinan Hata" },
                ].map((u, i) => (
                  <div key={i} className={styles.umkmItem}>
                    <span>{u.icon}</span>
                    <span>{u.name}</span>
                  </div>
                ))}
              </div>
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
