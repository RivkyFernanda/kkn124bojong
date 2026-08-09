"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "#beranda", label: "Beranda" },
  { href: "#profil", label: "Profil Desa" },
  { href: "#anggota", label: "Anggota" },
  { href: "#wisata", label: "Wisata" },
  { href: "#umkm", label: "UMKM" },
  { href: "#berita", label: "Berita" },
  { href: "#galeri", label: "Galeri" },
  { href: "#kontak", label: "Kontak" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      const sections = navLinks.map((l) => l.href.replace("#", ""));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop - 120 <= window.scrollY) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <img 
              src="/image/logo-KKN-124.png" 
              alt="Logo KKN 124" 
              className={styles.logoImg}
            />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>KKN 124</span>
            <span className={styles.logoSub}>Desa Bojong</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className={styles.navLinks}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              className={`${styles.navLink} ${
                activeSection === link.href.replace("#", "") ? styles.active : ""
              }`}
              onClick={() => handleNavClick(link.href)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className={styles.navActions}>
          <Link href="/login" className={styles.btnLogin}>
            <span>🔐</span> Login Admin
          </Link>
          <button
            className={`${styles.menuToggle} ${menuOpen ? styles.menuOpen : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
        {navLinks.map((link) => (
          <button
            key={link.href}
            className={`${styles.mobileNavLink} ${
              activeSection === link.href.replace("#", "") ? styles.activeMobile : ""
            }`}
            onClick={() => handleNavClick(link.href)}
          >
            {link.label}
          </button>
        ))}
        <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setMenuOpen(false)}>
          🔐 Login Admin
        </Link>
      </div>
    </header>
  );
}
