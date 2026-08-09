"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import styles from "./Gallery.module.css";

const defaultGallery = [
  { id: "1", title: "Sungai Citumang", description: "Keindahan air jernih biru tosca Citumang yang mempesona", emoji: "🌊", bg: "linear-gradient(135deg, #003355, #0077b6)", wide: true },
  { id: "2", title: "Hamparan Sawah", description: "Persawahan hijau yang membentang indah", emoji: "🌾", bg: "linear-gradient(135deg, #0f2d1e, #1a7f5a)" },
  { id: "3", title: "Kerajinan Golok", description: "Golok tradisional hasil karya pengrajin lokal", emoji: "⚔️", bg: "linear-gradient(135deg, #2d1e0f, #c07c3b)" },
  { id: "4", title: "Wayang Golek", description: "Seni wayang golek yang dilestarikan warga desa", emoji: "🎭", bg: "linear-gradient(135deg, #1e0f2d, #7c3bc0)" },
  { id: "5", title: "Gendang Tradisional", description: "Tabuhan gendang pengiring ritual dan kesenian desa", emoji: "🥁", bg: "linear-gradient(135deg, #2d1a0f, #8b5e2f)", wide: true },
  { id: "6", title: "Kegiatan KKN", description: "Mahasiswa KKN 124 bersama warga Desa Bojong", emoji: "🤝", bg: "linear-gradient(135deg, #0a1520, #1a7f5a)" },
  { id: "7", title: "Opak & Seriping", description: "Kuliner khas Desa Bojong yang lezat dan gurih", emoji: "🍌", bg: "linear-gradient(135deg, #1e2d0f, #5c8b2f)" },
  { id: "8", title: "Perbukitan Parigi", description: "Panorama alam pegunungan yang memukau", emoji: "🏔️", bg: "linear-gradient(135deg, #0f1520, #003355)" },
];

export default function Gallery() {
  const [galleryList, setGalleryList] = useState(defaultGallery);
  const [lightbox, setLightbox] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("title"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setGalleryList(data);
        }
      } catch {
        // use default data
      }
    };
    fetchGallery();
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

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && lightbox !== null) {
        setLightbox((prev) => (prev + 1) % galleryList.length);
      }
      if (e.key === "ArrowLeft" && lightbox !== null) {
        setLightbox((prev) => (prev - 1 + galleryList.length) % galleryList.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, galleryList.length]);

  return (
    <section id="galeri" className={styles.gallery} ref={sectionRef}>
      <div className={styles.bgBlob} />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} fade-up`}>
          <span className={styles.label}>Galeri Foto</span>
          <h2 className={styles.title}>
            Keindahan <span className="text-gradient-green">Desa Bojong</span>
          </h2>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            Abadikan setiap momen indah bersama warga dan pesona alam Desa Bojong —
            dari sungai jernih Citumang hingga hamparan sawah yang membentang hijau.
          </p>
        </div>

        {/* Masonry/Grid Gallery */}
        <div className={styles.galleryGrid}>
          {galleryList.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.galleryItem} ${item.wide ? styles.wide : ""} fade-up`}
              onClick={() => setLightbox(i)}
              role="button"
              tabIndex={0}
              aria-label={`Lihat foto: ${item.title}`}
              onKeyDown={(e) => e.key === "Enter" && setLightbox(i)}
            >
              <div
                className={styles.itemBg}
                style={{
                  background: item.imageUrl
                    ? `url(${item.imageUrl}) center/cover no-repeat`
                    : item.bg || "linear-gradient(135deg, #0d1b2a, #1b2e3c)",
                }}
              />
              <div className={styles.itemOverlay} />
              <div className={styles.itemEmoji}>{item.emoji || "📸"}</div>
              <div className={styles.itemContent}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDesc}>{item.description}</p>
              </div>
              <div className={styles.zoomIcon}>🔍</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox galeri foto"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>

            {galleryList[lightbox] && (
              <>
                <div
                  className={styles.lightboxImage}
                  style={{
                    background: galleryList[lightbox].imageUrl
                      ? `url(${galleryList[lightbox].imageUrl}) center/cover no-repeat`
                      : galleryList[lightbox].bg || "linear-gradient(135deg, #0d1b2a, #1b2e3c)",
                  }}
                >
                  {!galleryList[lightbox].imageUrl && (
                    <span className={styles.lightboxEmoji}>{galleryList[lightbox].emoji}</span>
                  )}
                </div>
                <div className={styles.lightboxInfo}>
                  <h3>{galleryList[lightbox].title}</h3>
                  <p>{galleryList[lightbox].description}</p>
                </div>
              </>
            )}

            {/* Navigation */}
            <button
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={() => setLightbox((prev) => (prev - 1 + galleryList.length) % galleryList.length)}
              aria-label="Foto sebelumnya"
            >‹</button>
            <button
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={() => setLightbox((prev) => (prev + 1) % galleryList.length)}
              aria-label="Foto berikutnya"
            >›</button>

            <div className={styles.lightboxCounter}>
              {lightbox + 1} / {galleryList.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
