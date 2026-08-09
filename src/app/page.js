import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Anggota from "@/components/Anggota";
import Wisata from "@/components/Wisata";
import Umkm from "@/components/Umkm";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Anggota />
      <Wisata />
      <Umkm />
      <Gallery />
      <Footer />
    </main>
  );
}
