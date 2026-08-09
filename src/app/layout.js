import { Outfit, Merriweather } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata = {
  title: "Desa Wisata Bojong | KKN 124 UIN Saizu Purwokerto",
  description:
    "Website resmi KKN Kelompok 124 UIN Saizu Purwokerto Angkatan 58 di Desa Bojong, Kecamatan Parigi, Kabupaten Pangandaran. Temukan wisata Citumang Body Rafting, UMKM unggulan, dan keindahan alam Desa Bojong.",
  keywords:
    "KKN 124, UIN Saizu, Desa Bojong, Citumang, Body Rafting, Pangandaran, UMKM, Wisata, Parigi",
  openGraph: {
    title: "Desa Wisata Bojong | KKN 124 UIN Saizu Purwokerto",
    description:
      "Jelajahi Citumang Body Rafting, UMKM kerajinan tangan, dan keindahan alam Desa Bojong.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${merriweather.variable}`}>
      <body>{children}</body>
    </html>
  );
}
