"use client";
import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./Anggota.module.css";

const DIVISI_COLORS = {
  "Ketua": "green",
  "Sekretaris": "water",
  "Bendahara": "warm",
  "Humas": "purple",
  "Pendidikan": "teal",
  "Kesehatan": "red",
  "Lingkungan": "green",
  "Ekonomi": "warm",
  "Acara": "purple",
  "Dokumentasi": "water",
};

function getColor(divisi) {
  for (const [key, val] of Object.entries(DIVISI_COLORS)) {
    if (divisi?.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "green";
}

const AVATAR_INITIALS = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Anggota() {
  const sectionRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const q = query(collection(db, "anggota"), orderBy("nama", "asc"));
        const snap = await getDocs(q).catch(() =>
          getDocs(collection(db, "anggota"))
        );
        setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [members]);

  return (
    <section id="anggota" className={styles.anggota} ref={sectionRef}>
      {/* BG Decorations */}
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} fade-up`}>
          <span className={styles.sectionLabel}>Tim KKN</span>
          <h2 className={styles.sectionTitle}>
            Struktur{" "}
            <span className="text-gradient-green">Anggota KKN 124</span>
          </h2>
          <div className={styles.divider} />
          <p className={styles.sectionSubtitle}>
            Kenali para mahasiswa KKN Kelompok 124 UIN Saizu Purwokerto yang
            berdedikasi mengabdi di Desa Bojong, Kec. Parigi, Kab. Pangandaran.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={`${styles.skeletonAvatar} skeleton`} />
                <div className={`${styles.skeletonLine} skeleton`} style={{ width: "70%" }} />
                <div className={`${styles.skeletonLine} skeleton`} style={{ width: "50%" }} />
                <div className={`${styles.skeletonLine} skeleton`} style={{ width: "60%" }} />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className={`${styles.emptyState} fade-up`}>
            <div className={styles.emptyIcon}>👥</div>
            <h3>Data anggota belum tersedia</h3>
            <p>Admin akan segera menambahkan data anggota KKN.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {members.map((member) => {
              const color = getColor(member.divisi);
              const initials = AVATAR_INITIALS(member.nama);
              const igUrl = member.instagram
                ? member.instagram.startsWith("http")
                  ? member.instagram
                  : `https://instagram.com/${member.instagram.replace("@", "")}`
                : null;

              return (
                <div key={member.id} className={`${styles.card} fade-up`}>
                  {/* Avatar */}
                  <div className={`${styles.avatarWrapper} ${styles[`avatar--${color}`]}`}>
                    <div className={styles.avatarInitials}>{initials}</div>
                    <div className={styles.avatarRing} />
                  </div>

                  {/* Info */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.memberName}>{member.nama}</h3>

                    <div className={styles.badgeRow}>
                      <span className={`${styles.badge} ${styles[`badge--${color}`]}`}>
                        {member.divisi || "Anggota"}
                      </span>
                    </div>

                    <div className={styles.metaList}>
                      {member.prodi && (
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>🎓</span>
                          <span className={styles.metaText}>{member.prodi}</span>
                        </div>
                      )}
                      {member.nim && (
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>🪪</span>
                          <span className={styles.metaText}>{member.nim}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instagram Button */}
                  {igUrl ? (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.igBtn}
                      id={`ig-link-${member.id}`}
                      aria-label={`Instagram ${member.nama}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>Instagram</span>
                    </a>
                  ) : (
                    <div className={styles.igBtnDisabled}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>—</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
