"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import styles from "./Wisata.module.css";

const defaultWisata = [];

export default function Wisata() {
  const [wisataList, setWisataList] = useState(defaultWisata);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchWisata = async () => {
      try {
        const q = query(collection(db, "wisata"), orderBy("name"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setWisataList(data);
        }
      } catch {
        // use default data
      }
    };
    fetchWisata();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 120);
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
    <section id="wisata" className={styles.wisata} ref={sectionRef}>
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} fade-up`}>
          <span className={styles.label}>Destinasi Wisata</span>
          <h2 className={styles.title}>
            Pesona <span className="text-gradient-water">Wisata Alam</span>{" "}
            <br />Desa Bojong
          </h2>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            Desa Bojong menawarkan wisata alam yang memukau, mulai dari petualangan
            body rafting di sungai Citumang hingga pemandangan persawahan yang menenangkan jiwa.
          </p>
        </div>

        {wisataList.length === 0 ? (
          <div className={`${styles.emptyCard} fade-up`}>
            <div className={styles.emptyIcon}>🌿</div>
            <h3 className={styles.emptyTitle}>Belum ada destinasi wisata</h3>
            <p className={styles.emptyDesc}>
              Admin dapat menambahkan destinasi wisata melalui panel admin dengan nama, deskripsi,
              dan gambar.
            </p>
          </div>
        ) : (
          <div className={`${styles.cardGrid} fade-up`}>
            {wisataList.map((w) => (
              <article key={w.id} className={styles.wisataCard}>
                <div className={styles.cardVisual}>
                  {w.imageUrl ? (
                    <img src={w.imageUrl} alt={w.name} className={styles.cardImage} loading="lazy" />
                  ) : (
                    <div className={styles.cardPlaceholder}>🌿</div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{w.name}</h3>
                  <p className={styles.cardDesc}>{w.description}</p>
                  <div className={styles.cardMeta}>
                    {w.price && <span>💰 {w.price}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
