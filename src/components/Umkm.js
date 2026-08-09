"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import styles from "./Umkm.module.css";

const defaultUmkm = [];

export default function Umkm() {
  const [umkmList, setUmkmList] = useState(defaultUmkm);
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

        {umkmList.length === 0 ? (
          <div className={`${styles.emptyCard} fade-up`}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h3 className={styles.emptyTitle}>Belum ada produk unggulan</h3>
            <p className={styles.emptyDesc}>
              Admin dapat menambahkan produk UMKM atau kerajinan melalui panel admin dengan nama,
              deskripsi, dan gambar.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {umkmList.map((item, i) => (
              <div key={item.id} className={`${styles.card} fade-up`} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={styles.cardVisual}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className={styles.cardImage} loading="lazy" />
                  ) : (
                    <div className={styles.cardPlaceholder}>🛍️</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{item.name}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
