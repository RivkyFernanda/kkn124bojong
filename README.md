This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Cloudinary Upload Setup

This project can upload images directly to Cloudinary from the admin panel for:
- Wisata
- UMKM
- Galeri
- Berita

### Langkah 1: Buat akun dan upload preset
1. Masuk ke akun Cloudinary Anda di https://cloudinary.com.
2. Pergi ke Dashboard dan catat `Cloud name`.
3. Ke menu `Settings` → `Upload`.
4. Di bagian `Upload presets`, buat preset baru.
   - Isi nama preset, misalnya `kkn124bojong_upload`.
   - Aktifkan `Unsigned` agar upload dapat dilakukan dari browser.
   - Simpan preset.

### Langkah 2: Buat `.env.local`
Di root proyek, buat file `.env.local` dengan isi:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=hyhl8ka4
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nama_upload_preset_anda
NEXT_PUBLIC_CLOUDINARY_FOLDER=kkn124bojong
```

Ganti `nama_upload_preset_anda` dengan nama preset yang Anda buat.

### Langkah 3: Jalankan aplikasi

```bash
npm run dev
```

### Langkah 4: Gunakan fitur upload di panel admin
1. Buka `/admin` dan login sebagai admin.
2. Pilih tab `Wisata`, `UMKM`, `Galeri`, atau `Berita`.
3. Klik `Tambah Data` atau `Edit`.
4. Pilih file gambar pada form `Unggah gambar langsung ke Cloudinary`.
5. Setelah upload selesai, URL tersimpan otomatis di form.
6. Simpan item untuk menyimpan metadata ke Firestore.

### Catatan
- Gambar akan tersimpan di Cloudinary pada folder yang ditentukan oleh `NEXT_PUBLIC_CLOUDINARY_FOLDER`.
- Pastikan `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dan `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` sudah benar.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
