"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import styles from "./Wisata.module.css";

const defaultWisata = [
  {
    id: "citumang-body-rafting",
    name: "Citumang Body Rafting",
    description:
      "Nikmati petualangan seru menyusuri sungai Citumang yang jernih dengan air berwarna biru tosca memukau. Body rafting Citumang adalah pengalaman yang wajib dicoba saat berkunjung ke Desa Bojong.",
    price: "Rp 85.000 – Rp 150.000 / orang",
    location: "Desa Bojong, Kec. Parigi",
    openHour: "07.00 – 16.00 WIB",
    tag: "Andalan",
    emoji: "🏄‍♂️",
    color: "#00b4d8",
    tips: ["Wajib bisa berenang / gunakan pelampung", "Bawa pakaian ganti", "Jam terbaik pagi hari", "Tersedia pemandu lokal"],
  },
];

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

        {/* Feature highlight - Citumang */}
        <div className={`${styles.featuredCard} fade-up`}>
          <div className={styles.featuredVisual}>
            <div className={styles.waterAnimation}>
              <div className={styles.waterRipple} />
              <div className={styles.waterRipple} style={{ animationDelay: "0.5s" }} />
              <div className={styles.waterRipple} style={{ animationDelay: "1s" }} />
              <div className={styles.mainEmoji}>🏄‍♂️</div>
            </div>
            <div className={styles.featuredBadge}>
              <span>⭐</span> Destinasi Unggulan
            </div>
          </div>

          <div className={styles.featuredInfo}>
            <div className={styles.featuredTag}>Body Rafting · Wisata Alam</div>
            <h3 className={styles.featuredName}>Citumang Body Rafting</h3>
            <p className={styles.featuredDesc}>
              Sungai Citumang adalah permata tersembunyi Pangandaran. Air jernih berwarna biru tosca
              mengalir di antara tebing-tebing hijau yang memukau. Dengan panjang lintasan sekitar
              1,5 km, body rafting di sini memberikan pengalaman tak terlupakan bagi para petualang.
            </p>

            <div className={styles.infoRow}>
              <div className={styles.infoChip}>
                <span>💰</span>
                <div>
                  <small>Harga Tiket</small>
                  <strong>Rp 85.000 – 150.000</strong>
                </div>
              </div>
              <div className={styles.infoChip}>
                <span>🕐</span>
                <div>
                  <small>Jam Operasional</small>
                  <strong>07.00 – 16.00 WIB</strong>
                </div>
              </div>
              <div className={styles.infoChip}>
                <span>📍</span>
                <div>
                  <small>Lokasi</small>
                  <strong>Desa Bojong, Parigi</strong>
                </div>
              </div>
            </div>

            <div className={styles.tipsList}>
              <h4>💡 Tips Berkunjung</h4>
              <div className={styles.tipsGrid}>
                {["Wajib bisa berenang / gunakan pelampung", "Bawa pakaian ganti", "Datang pagi untuk air paling jernih", "Tersedia pemandu lokal berpengalaman"].map((tip, i) => (
                  <div key={i} className={styles.tipItem}>
                    <span className={styles.tipCheck}>✓</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Wisata Cards (from Firestore if any) */}
        {wisataList.length > 1 && (
          <div className={`${styles.cardGrid} fade-up`}>
            {wisataList.slice(1).map((w) => (
              <div key={w.id} className={styles.wisataCard}>
                <div className={styles.cardEmoji}>{w.emoji || "🌟"}</div>
                <h3 className={styles.cardName}>{w.name}</h3>
                <p className={styles.cardDesc}>{w.description}</p>
                <div className={styles.cardMeta}>
                  <span>💰 {w.price}</span>
                  <span>📍 {w.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nearby Attractions */}
        <div className={`${styles.nearbySection} fade-up`}>
          <h3 className={styles.nearbyTitle}>🗺️ Pesona Lain di Sekitar Desa Bojong</h3>
          <div className={styles.nearbyGrid}>
            {[
              { icon: "🌾", name: "Hamparan Sawah", desc: "Pemandangan sawah hijau yang membentang luas" },
              { icon: "🏔️", name: "Perbukitan Parigi", desc: "Udara segar dan panorama pegunungan yang indah" },
              { icon: "🎪", name: "Kerajinan Tradisional", desc: "Sentra kerajinan golok, gendang, dan wayang golek" },
              { icon: "🍌", name: "Kuliner Lokal", desc: "Opak dan seriping pisang khas warga Desa Bojong" },
            ].map((item, i) => (
              <div key={i} className={styles.nearbyCard}>
                <div className={styles.nearbyIcon}>{item.icon}</div>
                <h4 className={styles.nearbyName}>{item.name}</h4>
                <p className={styles.nearbyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
