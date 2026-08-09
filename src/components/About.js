"use client";
import { useEffect, useRef } from "react";
import styles from "./About.module.css";

const highlights = [
  {
    icon: "🏔️",
    title: "Geografis Strategis",
    desc: "Terletak di Kecamatan Parigi, Kabupaten Pangandaran, dikelilingi alam pegunungan dan aliran sungai Citumang yang jernih.",
  },
  {
    icon: "🎭",
    title: "Kaya Budaya",
    desc: "Rumah bagi kerajinan wayang golek, gendang tradisional, dan golok khas Bojong yang turun-temurun diwariskan.",
  },
  {
    icon: "🌾",
    title: "Pertanian Subur",
    desc: "Hamparan persawahan yang luas menjadi tulang punggung ekonomi warga dan mempercantik panorama desa.",
  },
  {
    icon: "🤝",
    title: "KKN Angkatan 58",
    desc: "Kelompok 124 UIN Saizu Purwokerto hadir untuk berkontribusi, mendokumentasikan, dan mengembangkan potensi Desa Bojong.",
  },
];

const kknMembers = [
  "Pengembangan Website Desa",
  "Pendataan UMKM Lokal",
  "Promosi Wisata Citumang",
  "Pemberdayaan Masyarakat",
  "Literasi Digital Warga",
  "Pemetaan Potensi Desa",
];

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="profil" className={styles.about} ref={sectionRef}>
      {/* BG Decoration */}
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={`${styles.header} fade-up`}>
          <span className={styles.sectionLabel}>Profil Desa</span>
          <h2 className={styles.sectionTitle}>
            Mengenal{" "}
            <span className="text-gradient-green">Desa Bojong</span>
          </h2>
          <div className={styles.divider} />
          <p className={styles.sectionSubtitle}>
            Desa Bojong adalah permata tersembunyi di Kecamatan Parigi, Kabupaten Pangandaran —
            tempat di mana alam yang memukau berpadu harmonis dengan tradisi leluhur yang kaya.
          </p>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left: Map Card */}
          <div className={`${styles.mapCard} fade-up`}>
            <div className={styles.mapVisual}>
              <div className={styles.mapPin}>
                <span className={styles.mapPinDot} />
                <span className={styles.mapPinRing} />
              </div>
              <div className={styles.mapLabel}>
                <strong>Desa Bojong</strong>
                <span>Kec. Parigi, Kab. Pangandaran</span>
                <span>Jawa Barat, Indonesia</span>
              </div>
              <div className={styles.mapDecorations}>
                <span className={styles.mapDecItem}>🌊 Sungai Citumang</span>
                <span className={styles.mapDecItem}>🌾 Area Persawahan</span>
                <span className={styles.mapDecItem}>🏔️ Perbukitan Parigi</span>
              </div>
            </div>
            {/* Info Grid */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <strong>Kecamatan</strong>
                  <p>Parigi</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🗺️</span>
                <div>
                  <strong>Kabupaten</strong>
                  <p>Pangandaran</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🌏</span>
                <div>
                  <strong>Provinsi</strong>
                  <p>Jawa Barat</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>👥</span>
                <div>
                  <strong>KKN Kelompok</strong>
                  <p>124 · Angkatan 58</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Highlights */}
          <div className={styles.highlightsArea}>
            {highlights.map((item, idx) => (
              <div key={idx} className={`${styles.highlightCard} fade-up`}>
                <div className={styles.highlightIcon}>{item.icon}</div>
                <div>
                  <h3 className={styles.highlightTitle}>{item.title}</h3>
                  <p className={styles.highlightDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KKN Programs */}
        <div className={`${styles.kknPrograms} fade-up`}>
          <h3 className={styles.programTitle}>🎯 Program KKN Kelompok 124</h3>
          <div className={styles.programGrid}>
            {kknMembers.map((program, i) => (
              <div key={i} className={styles.programBadge}>
                <span className={styles.programCheck}>✓</span>
                {program}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
