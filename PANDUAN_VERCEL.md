# Panduan Deploy Vercel & Setup Firebase Storage

Dokumen ini menjelaskan langkah-langkah untuk mengunggah proyek KKN 124 Bojong ke **Vercel** secara gratis, serta mengonfigurasi **Firebase Storage** agar fitur unggah gambar berjalan lancar.

---

## ☁️ BAGIAN 1: Mengaktifkan Firebase Storage

Karena Vercel berjalan pada sistem file serverless yang bersifat read-only/temporary (tidak bisa menyimpan file permanen di server local), seluruh file gambar/foto diunggah ke **Firebase Storage**.

1. Buka [Firebase Console](https://console.firebase.google.com/) dan masuk ke proyek Anda.
2. Di menu navigasi sebelah kiri, klik **Build** (ikon palu) → pilih **Storage**.
3. Klik tombol **Get Started** (Mulai).
4. **Pilih Aturan Awal (Security Rules)**:
   * Pilih opsi **Start in test mode** (Mulai dalam mode pengujian) agar dapat langsung diuji.
   * Klik tombol **Next**.
5. **Pilih Lokasi Server Storage**:
   * Samakan wilayah server Storage dengan lokasi Realtime Database Anda (misalnya Singapura / `asia-southeast1`).
   * Klik tombol **Done** (Selesai).
6. **Ubah Rules Keamanan Storage**:
   * Setelah storage aktif, buka tab **Rules** (Aturan) di bagian atas.
   * Ubah kode aturan menjadi berikut untuk menjamin keamanan (hanya admin terotentikasi yang dapat menulis/mengunggah gambar, namun semua orang dapat melihatnya):
     ```rules
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read: if true;
           allow write: if request.auth != null;
         }
       }
     }
     ```
   * Klik tombol **Publish** (Publikasikan).

---

## 🚀 BAGIAN 2: Deploy ke Vercel

Setelah database Firebase dan Firebase Storage diaktifkan, mari deploy proyek web statis berbasis Vite ini ke Vercel.

### Metode A: Menggunakan GitHub (Sangat Direkomendasikan)
1. Unggah kode proyek Anda ke repositori **GitHub** (buat repositori pribadi / private jika Anda ingin merahasiakan Web API Key Firebase).
2. Masuk ke [Vercel Dashboard](https://vercel.com/).
3. Klik tombol **Add New...** → pilih **Project**.
4. Hubungkan akun GitHub Anda, lalu cari repositori proyek Anda dan klik **Import**.
5. **Configure Project**:
   * Vercel akan mendeteksi proyek secara otomatis sebagai proyek **Vite**.
   * Biarkan *Build and Development Settings* pada setelan **default** (tidak perlu diubah).
6. Klik tombol **Deploy**.
7. Tunggu proses build selesai (kurang dari 1 menit). Halaman website Anda kini live dan dapat diakses publik dengan alamat gratis `https://nama-proyek.vercel.app/`!

### Metode B: Menggunakan Vercel CLI (Secara Lokal via Terminal)
Jika Anda memiliki Node.js terpasang secara lokal, Anda dapat men-deploy langsung lewat CMD/PowerShell:
1. Buka terminal pada folder proyek Anda: `c:\xampp\htdocs\kkn124bojong\`
2. Jalankan perintah untuk mengunduh vercel:
   ```bash
   npm install -g vercel
   ```
3. Login ke Vercel dengan perintah:
   ```bash
   vercel login
   ```
4. Deploy proyek dengan menjalankan perintah:
   ```bash
   vercel
   ```
   * Ikuti perintah di layar (tekan Enter untuk menyetujui setelan default).
5. Deploy untuk produksi (live) dengan perintah:
   ```bash
   vercel --prod
   ```
   
---

## 🧪 Cara Pengujian Akhir
1. Buka URL website yang diberikan oleh Vercel.
2. Akses halaman login admin di `/login.html`.
3. Masuk dengan akun admin Firebase Anda.
4. Coba tambahkan anggota baru atau unggah berita lengkap dengan foto covernya. Foto akan langsung terunggah ke Firebase Storage secara serverless, dan datanya tersimpan di Firebase Realtime Database!
