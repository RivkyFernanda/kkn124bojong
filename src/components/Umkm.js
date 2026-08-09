"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import styles from "./Umkm.module.css";

const defaultUmkm = [
  { id: "1", name: "Kerajinan Golok", category: "Kerajinan", owner: "Pengrajin Bojong", description: "Golok tradisional berkualitas tinggi buatan tangan para pandai besi Desa Bojong, dibuat dengan teknik turun-temurun.", price: "Rp 150.000 – 500.000", emoji: "⚔️", contact: "-" },
  { id: "2", name: "Gendang Tradisional", category: "Seni", owner: "Pengrajin Lokal", description: "Gendang khas dengan ukiran motif tradisional Sunda, dibuat dari kayu pilihan dan kulit binatang pilihan.", price: "Rp 200.000 – 800.000", emoji: "🥁", contact: "-" },
  { id: "3", name: "Wayang Golek", category: "Seni", owner: "Dalang Bojong", description: "Wayang golek buatan tangan dengan detail ukiran yang halus, mencerminkan kesenian tradisional Jawa Barat.", price: "Rp 250.000 – 1.000.000", emoji: "🎭", contact: "-" },
  { id: "4", name: "Opak Khas Bojong", category: "Makanan", owner: "UMKM Kuliner", description: "Opak renyah gurih berbahan baku singkong pilihan, camilan tradisional favorit dari Desa Bojong.", price: "Rp 15.000 – 35.000", emoji: "🥮", contact: "-" },
  { id: "5", name: "Seriping Pisang", category: "Makanan", owner: "Ibu-Ibu PKK", description: "Keripik pisang renyah dengan berbagai varian rasa, dibuat dari pisang lokal pilihan warga desa.", price: "Rp 10.000 – 25.000", emoji: "🍌", contact: "-" },
  { id: "6", name: "Kerajinan Hata", category: "Kerajinan", owner: "Kelompok Perajin", description: "Kerajinan anyaman dan rajutan khas desa dengan motif tradisional yang unik dan bernilai seni tinggi.", price: "Rp 50.000 – 300.000", emoji: "🧺", contact: "-" },
];

const categories = ["Semua", "Kerajinan", "Seni", "Makanan"];

const categoryColors = {
  Kerajinan: { bg: "rgba(192, 124, 59, 0.15)", border: "rgba(192, 124, 59, 0.35)", color: "#e09a5a" },
  Seni: { bg: "rgba(0, 180, 216, 0.12)", border: "rgba(0, 180, 216, 0.3)", color: "#90e0ef" },
  Makanan: { bg: "rgba(78, 204, 163, 0.12)", border: "rgba(78, 204, 163, 0.3)", color: "#4ecca3" },
};

export default function Umkm() {
  const [umkmList, setUmkmList] = useState(defaultUmkm);
  const [filter, setFilter] = useState("Semua");
  const [hoveredId, setHoveredId] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchUmkm = async () => {
      try {
        const q = query(collection(db, "umkm"), orderBy("name"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setUmkmList(data);
        }
      } catch {
        // use default data
      }
    };
    fetchUmkm();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 80);
            });
          }
        });
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filtered = filter === "Semua" ? umkmList : umkmList.filter((u) => u.category === filter);

  return (
    <section id="umkm" className={styles.umkm} ref={sectionRef}>
      <div className={styles.bgDecor1} />
      <div className={styles.bgDecor2} />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} fade-up`}>
          <span className={styles.label}>Produk Unggulan</span>
          <h2 className={styles.title}>
            UMKM & Kerajinan{" "}
            <span className="text-gradient-warm">Desa Bojong</span>
          </h2>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            Desa Bojong memiliki berbagai produk UMKM unggulan — dari kerajinan tangan tradisional
            hingga kuliner khas yang lezat. Dukung produk lokal, majukan perekonomian desa!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={`${styles.filterTabs} fade-up`}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat === "Semua" && "🌟 "}
              {cat === "Kerajinan" && "⚒️ "}
              {cat === "Seni" && "🎨 "}
              {cat === "Makanan" && "🍽️ "}
              {cat}
            </button>
          ))}
          <span className={styles.filterCount}>{filtered.length} produk</span>
        </div>

        {/* UMKM Grid */}
        <div className={styles.grid}>
          {filtered.map((item, i) => {
            const catStyle = categoryColors[item.category] || categoryColors.Kerajinan;
            return (
              <div
                key={item.id}
                className={`${styles.card} fade-up`}
                style={{ animationDelay: `${i * 60}ms` }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.emojiBox}>{item.emoji || "🛍️"}</div>
                  <span
                    className={styles.categoryBadge}
                    style={{ background: catStyle.bg, borderColor: catStyle.border, color: catStyle.color }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Card Body */}
                <h3 className={styles.cardName}>{item.name}</h3>
                {item.owner && item.owner !== "-" && (
                  <p className={styles.cardOwner}>👤 {item.owner}</p>
                )}
                <p className={styles.cardDesc}>{item.description}</p>

                {/* Price */}
                <div className={styles.cardFooter}>
                  <div className={styles.priceTag}>
                    <span className={styles.priceLabel}>Harga</span>
                    <span className={styles.priceValue}>{item.price}</span>
                  </div>
                  {item.contact && item.contact !== "-" && (
                    <a
                      href={`https://wa.me/${item.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactBtn}
                    >
                      📞 Hubungi
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className={`${styles.ctaBanner} fade-up`}>
          <div className={styles.ctaContent}>
            <h3>🤝 Dukung UMKM Lokal Desa Bojong</h3>
            <p>
              Dengan membeli produk lokal, Anda turut berkontribusi dalam meningkatkan
              kesejahteraan warga dan melestarikan budaya Desa Bojong.
            </p>
          </div>
          <div className={styles.ctaIcons}>
            <span>⚔️</span><span>🥁</span><span>🎭</span><span>🍌</span>
          </div>
        </div>
      </div>
    </section>
  );
}
