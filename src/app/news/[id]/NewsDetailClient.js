"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@/components/News.module.css";

export default function NewsDetailClient({ id }) {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const ref = doc(db, "news", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <div style={{padding: '2rem'}}>Memuat berita...</div>;
  if (!item) return <div style={{padding: '2rem'}}>Berita tidak ditemukan.</div>;

  const categories = (item.category || "").split(",").map((c) => c.trim()).filter(Boolean);

  return (
    <main style={{padding: '2rem'}}>
      <div style={{maxWidth: 900, margin: '0 auto'}}>
        {item.thumbnailUrl && (
          <div style={{marginBottom: '1rem'}}>
            <img src={item.thumbnailUrl} alt={item.title} style={{width: '100%', borderRadius: 12, objectFit: 'cover'}} />
          </div>
        )}
        <h1 style={{margin: '0 0 0.5rem', fontSize: '1.8rem'}}>{item.title}</h1>
        {categories.length > 0 && (
          <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
            {categories.map((c) => (
              <span key={c} style={{padding: '6px 10px', borderRadius: 999, background: 'rgba(26,127,90,0.08)', color: '#4ecca3', fontWeight:700, fontSize: '0.86rem'}}>{c}</span>
            ))}
          </div>
        )}
        <p style={{lineHeight: 1.8, color: 'rgba(0,0,0,0.8)'}}>{item.description}</p>
        {item.bodyImageUrl && (
          <div style={{marginTop: 16}}>
            <img src={item.bodyImageUrl} alt={item.title} style={{width: '100%', borderRadius: 12, objectFit: 'cover'}} />
          </div>
        )}

        <div style={{marginTop: 18}}>
          <button onClick={() => router.back()} className={styles.readMoreBtn}>Kembali</button>
        </div>
      </div>
    </main>
  );
}
