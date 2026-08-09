"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./News.module.css";

export default function News() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, "news"), orderBy("title", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(data);
      } catch {
        setItems([]);
      }
    };

    fetchNews();
  }, []);

  const categories = useMemo(() => {
    const all = items.flatMap((item) => (item.category || "").split(",").map((c) => c.trim()).filter(Boolean));
    return [...new Set(all)].slice(0, 6);
  }, [items]);

  return (
    <section id="berita" className={styles.newsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Berita & Kegiatan</span>
          <h2 className={styles.title}>
            Laporan <span className="text-gradient-green">Kegiatan KKN</span>
          </h2>
          <p className={styles.subtitle}>
            Simak perkembangan kegiatan, karya, dan momen penting yang dilakukan oleh KKN 124 Desa Bojong.
          </p>
        </div>

        {categories.length > 0 && (
          <div className={styles.tags}>
            {categories.map((cat) => (
              <span key={cat} className={styles.tag}>{cat}</span>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>📰</div>
            <h3 className={styles.emptyTitle}>Belum ada berita</h3>
            <p className={styles.emptyDesc}>
              Admin dapat menambahkan berita baru dengan thumbnail, judul, deskripsi, kategori,
              dan gambar penjelas di bagian tengah isi.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <article key={item.id} className={styles.card} onClick={() => setSelected(item)}>
                <div className={styles.thumbWrap}>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className={styles.thumb} loading="lazy" />
                  ) : (
                    <div className={styles.thumbPlaceholder}>📰</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                  <div className={styles.cardMeta}>
                    {(item.category || "").split(",").map((c) => c.trim()).filter(Boolean).slice(0, 3).map((cat) => (
                      <span key={cat} className={styles.metaTag}>{cat}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <h3 className={styles.modalTitle}>{selected.title}</h3>
            <p className={styles.modalDesc}>{selected.description}</p>
            {selected.bodyImageUrl && (
              <div className={styles.bodyImageWrap}>
                <img src={selected.bodyImageUrl} alt={selected.title} className={styles.bodyImage} />
              </div>
            )}
            {selected.category && (
              <div className={styles.modalTags}>
                {(selected.category || "").split(",").map((c) => c.trim()).filter(Boolean).map((cat) => (
                  <span key={cat} className={styles.metaTag}>{cat}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
