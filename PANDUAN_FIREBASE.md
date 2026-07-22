# Panduan Lengkap & Detail Hubungkan Database Firebase

Dokumen ini menjelaskan langkah demi langkah secara mendetail untuk mendaftar, membuat proyek Firebase, mengaktifkan Realtime Database & Authentication, mendapatkan API keys, serta mengonfigurasi website Anda agar terhubung secara dinamis dengan Firebase.

---

## 🛠️ LANGKAH 1: Membuat Proyek Firebase Baru

1. Buka browser Anda dan masuk ke website [Firebase Console](https://console.firebase.google.com/).
2. Login menggunakan **Akun Google/Gmail** Anda.
3. Di halaman utama Firebase Console, klik tombol besar **Add project** (Tambah proyek) atau **Create a project**.
4. **Beri Nama Proyek Anda**:
   * Masukkan nama proyek di kolom input, contoh: `kkn124bojong`.
   * Beri tanda centang pada persetujuan ketentuan Firebase, lalu klik **Continue**.
5. **Google Analytics**:
   * Di layar ini, Anda akan ditanya apakah ingin mengaktifkan Google Analytics untuk proyek Anda.
   * *Rekomendasi*: Nonaktifkan saja opsi **Enable Google Analytics for this project** agar proses pembuatan proyek berjalan lebih cepat dan sederhana.
   * Klik tombol **Create project**.
6. **Proses Setup Proyek**:
   * Tunggu sekitar 10 - 20 detik sampai proses pembuatan proyek oleh Firebase selesai.
   * Setelah selesai, akan muncul pesan *"Your new project is ready"*.
   * Klik tombol **Continue** (Lanjutkan) untuk masuk ke halaman Dashboard proyek Anda.

---

## 💻 LANGKAH 2: Mendaftarkan Aplikasi Web & Mendapatkan Web API Key

Untuk menghubungkan PHP dengan Firebase, Anda harus mendaftarkan proyek Firebase Anda sebagai aplikasi web terlebih dahulu untuk memunculkan **Web API Key**.

1. Di halaman utama Dashboard proyek Firebase Anda (halaman Project Overview), perhatikan ikon bulat di bawah tulisan *"Get started by adding Firebase to your app"*:
   * Klik ikon **`</>` (ikon Web)** untuk menambahkan aplikasi berbasis web.
2. **Register App (Daftarkan Aplikasi)**:
   * Masukkan nama aplikasi Anda pada kolom *App nickname*, misalnya: `Website KKN Bojong`.
   * Biarkan kotak *Also set up Firebase Hosting* tetap **kosong (jangan dicentang)**.
   * Klik tombol **Register app**.
3. **Salin Firebase SDK Config**:
   * Firebase akan menampilkan cuplikan kode Javascript berisi konfigurasi.
   * Cari baris yang bertuliskan `apiKey: "AIzaSy..."`.
   * Salin kode string di dalam tanda kutip tersebut. Kode unik inilah **Web API Key** Anda.
   * Klik tombol **Continue to console** untuk kembali ke halaman utama.
4. **Alternatif Menemukan Web API Key Lain Waktu**:
   * Jika sewaktu-waktu Anda lupa menyalinnya, klik ikon **Settings (roda gigi)** di kiri atas menu navigasi → pilih **Project settings**.
   * Di tab **General**, Anda akan menemukan kolom **Web API Key** tercantum di sana.

---

## 👥 LANGKAH 3: Mengaktifkan Firebase Authentication (Metode Email/Password)

Fitur ini digunakan untuk mengontrol login aman administrator ke panel kontrol dashboard website.

1. Di menu navigasi sebelah kiri Firebase Console, klik menu **Build** (ikon palu) → pilih sub-menu **Authentication**.
2. Klik tombol **Get Started** (Mulai) untuk mengaktifkan modul autentikasi.
3. **Pilih Metode Sign-in**:
   * Pada tab **Sign-in method** (Metode masuk), Anda akan melihat berbagai pilihan penyedia.
   * Cari dan klik pilihan **Email/Password**.
   * Di layar pop-up, aktifkan opsi **Email/Password** (ubah status tombol toggle paling atas menjadi aktif/biru).
   * Opsi *Email link (passwordless sign-in)* di bawahnya biarkan **tetap nonaktif (jangan dicentang)**.
   * Klik tombol **Save** (Simpan).
4. **Membuat Akun Admin Baru**:
   * Pindah ke tab **Users** (Pengguna) di bagian atas halaman Authentication.
   * Klik tombol **Add user** (Tambah pengguna) di sebelah kanan.
   * Masukkan data login baru yang ingin Anda buat untuk admin website Anda:
     * **Email**: `admin@kkn124bojong.com` (atau email pilihan Anda)
     * **Password**: `admin123` (atau sandi rahasia Anda, minimal harus 6 karakter)
   * Klik tombol **Add user** untuk menyimpan akun tersebut. Akun inilah yang akan Anda ketik saat masuk ke halaman `login.php` website.

---

## 💾 LANGKAH 4: Mengaktifkan Firebase Realtime Database

Modul ini berfungsi sebagai pengganti tabel database MySQL konvensional untuk menyimpan data dinamis anggota, berita, galeri, proker, pesan, dan pengaturan.

1. Di menu navigasi sebelah kiri Firebase Console, klik menu **Build** → pilih **Realtime Database**.
2. Klik tombol **Create Database** (Buat Database).
3. **Pilih Lokasi Server Database**:
   * Pilih lokasi database terdekat untuk akses tercepat di Indonesia.
   * *Rekomendasi*: Pilih **Singapore (`asia-southeast1`)**.
   * Klik tombol **Next** (Berikutnya).
4. **Pilih Aturan Awal (Security Rules)**:
   * Pilih opsi **Start in test mode** (Mulai dalam mode pengujian) agar database dapat diakses tulis/baca untuk sementara saat setup pertama kali.
   * Klik tombol **Enable** (Aktifkan).
5. **Salin URL Realtime Database**:
   * Di bagian atas tab **Data**, Anda akan melihat alamat URL database Anda yang diakhiri dengan `.firebaseio.com/`. Contohnya: `https://kkn124bojong-default-rtdb.asia-southeast1.firebasedatabase.app/`
   * Salin seluruh alamat URL tersebut. Nilai ini akan dimasukkan sebagai `FIREBASE_DB_URL` di file `config.php`.

---

## 🔒 LANGKAH 5: Konfigurasi Aturan Keamanan Database (Security Rules)

Langkah ini penting untuk memastikan hanya administrator yang dapat mengubah data website, sementara pengunjung umum hanya diizinkan untuk membaca data umum dan mengirim pesan melalui kontak form.

1. Di halaman Realtime Database proyek Anda, klik tab **Rules** (Aturan) di sebelah kanan tab Data.
2. Hapus seluruh isi aturan bawaan dan ganti dengan kode aturan JSON di bawah ini secara persis:
   ```json
   {
     "rules": {
       "pesan": {
         ".read": "auth != null",
         ".write": true
       },
       ".read": true,
       ".write": "auth != null"
     }
   }
   ```
3. Klik tombol biru **Publish** (Publikasikan) di bagian atas untuk menyimpan dan mengaktifkan aturan keamanan baru tersebut.

---

## ⚙️ LANGKAH 6: Konfigurasi Parameter di Website Anda (`config.php`)

Kini Anda telah memiliki semua kunci yang diperlukan. Mari hubungkan dengan website.

1. Buka folder root website KKN Anda di `c:\xampp\htdocs\kkn124bojong\`.
2. Buka file **`config.php`** menggunakan teks editor favorit Anda (seperti VS Code, Notepad++, atau Notepad biasa).
3. Cari baris kode berikut di bagian atas file:
   ```php
   $firebase_api_key = 'YOUR_FIREBASE_API_KEY';
   $firebase_db_url  = 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/';
   ```
4. Ubah isinya dengan kunci yang telah Anda salin dari langkah-langkah sebelumnya:
   * Ganti `'YOUR_FIREBASE_API_KEY'` dengan **Web API Key** yang Anda dapatkan di **Langkah 2** (misalnya: `'AIzaSyD-G19...'`).
   * Ganti `'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/'` dengan **URL Database** yang Anda dapatkan di **Langkah 4** (misalnya: `'https://kkn124bojong-default-rtdb.asia-southeast1.firebasedatabase.app/'`).
5. Simpan file `config.php` tersebut.

---

## 🧪 LANGKAH 7: Menguji Koneksi Firebase Website Anda

1. Pastikan modul Apache di XAMPP Control Panel Anda aktif/running.
2. Buka browser dan buka alamat:
   `http://localhost/kkn124bojong/index.php`
   * Halaman website akan terbuka dan menampilkan status website dalam keadaan bersih (tanpa data).
3. Sekarang akses halaman login admin di:
   `http://localhost/kkn124bojong/login.php`
4. Masukkan **Email** (atau ketik `admin` jika Anda menggunakan email virtual `admin@kkn124bojong.com`) beserta **Password** yang Anda daftarkan pada **Langkah 3**, lalu klik **Sign In**.
5. Jika berhasil masuk ke halaman dashboard admin, selamat! Website KKN 124 Bojong Anda kini telah terhubung secara dinamis dan aman dengan database Firebase.
