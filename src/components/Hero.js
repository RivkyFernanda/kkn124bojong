"use client";
import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

export default function Hero() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78, 204, 163, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleScroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="beranda" className={styles.hero}>
      {/* Background Image with Transparency */}
      <div className={styles.heroBgImage} />

      {/* Animated Particles */}
      <canvas ref={particlesRef} className={styles.particles} aria-hidden="true" />

      {/* Background Gradient Blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Content */}
      <div className={styles.heroContent}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          KKN Kelompok 124 · UIN Saizu Purwokerto · Angkatan 58
        </div>

        {/* Title */}
        <h1 className={styles.heroTitle}>
          Desa Wisata{" "}
          <span className={styles.titleHighlight}>Bojong</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Menjelajahi keindahan Citumang Body Rafting, kekayaan kerajinan tangan,
          dan hamparan sawah hijau yang memukau di Kecamatan Parigi, Kabupaten Pangandaran.
        </p>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🌿</span>
            <div>
              <strong>8+ Program</strong>
              <p>Unggulan terarah untuk desa</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🤝</span>
            <div>
              <strong>Tim Solid</strong>
              <p>Mahasiswa KKN siap membantu</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>✨</span>
            <div>
              <strong>Premium</strong>
              <p>Experience modern dan elegan</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={styles.heroButtons}>
          <button
            className={styles.btnExplore}
            onClick={() => handleScroll("wisata")}
          >
            <span>🏄</span> Jelajahi Wisata
          </button>
          <button
            className={styles.btnUmkm}
            onClick={() => handleScroll("umkm")}
          >
            <span>🛍️</span> Lihat UMKM
          </button>
        </div>
      </div>

      {/* Wave bottom */}
      <div className={styles.waveBottom}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#0d1b2a"
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
    </section>
  );
}
