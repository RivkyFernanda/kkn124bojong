"use client";
import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

export default function About() {
  const sectionRef = useRef(null);
  const [programs, setPrograms] = useState([]);

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

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const q = query(collection(db, "programs"), orderBy("urutan", "asc"));
        const snap = await getDocs(q);
        const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPrograms(items);
      } catch (error) {
        console.error("Gagal mengambil program unggulan:", error);
      }
    };

    fetchPrograms();
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
            <div className={styles.mapVisualContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15814.195159187313!2d108.48705669145695!3d-7.731427670154054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6597a7a1cbfb49%3A0xe54eef71415fbf10!2sBojong%2C%20Parigi%2C%20Pangandaran%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1723200000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Wilayah Desa Bojong"
                className={styles.mapIframe}
              ></iframe>
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
          <h3 className={styles.programTitle}>🎯 Program Unggulan KKN Kelompok 124</h3>
          {programs.length > 0 ? (
            <div className={styles.programGrid}>
              {programs.map((program, i) => (
                <div key={program.id || i} className={styles.programBadge}>
                  <span className={styles.programCheck}>{program.icon || "✨"}</span>
                  <div>
                    <strong>{program.title}</strong>
                    {program.description ? (
                      <div style={{ marginTop: "4px", fontSize: "0.95rem", color: "rgba(255,255,255,0.75)" }}>
                        {program.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.sectionSubtitle} style={{ marginTop: "12px" }}>
              Program unggulan akan ditambahkan oleh admin.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
