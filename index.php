<?php
// index.php
// Main landing page for KKN 124 Desa Bojong (Public Non-Login View)
require_once 'config.php';
$settings = get_settings();
$anggota_list = get_anggota();
$proker_list = get_program_kerja();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>KKN 124 UIN Saizu Desa Bojong - Parigi, Pangandaran</title>
    <meta name="description" content="Portal Resmi KKN Kelompok 124 UIN Prof. K.H. Saifuddin Zuhri Purwokerto di Desa Bojong, Kecamatan Parigi, Kabupaten Pangandaran. Menyajikan profil, struktur anggota, program kerja, galeri kegiatan, dan berita terbaru.">
    <meta name="keywords" content="KKN 124, Desa Bojong, Parigi, Pangandaran, UIN Saizu, UIN Purwokerto, Kuliah Kerja Nyata, UIN Prof K.H. Saifuddin Zuhri">
    <meta name="author" content="KKN 124 Desa Bojong">
    
    <!-- Favicon -->
    <link rel="shortcut icon" href="https://uinsaizu.ac.id/wp-content/uploads/2021/04/cropped-Logo-UIN-SAIZU-192x192.png" type="image/x-icon">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    
    <!-- Master CSS Stylesheet -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- ======================================================
         1. NAVIGATION BAR
         ====================================================== -->
    <nav class="navbar">
        <div class="container">
            <a href="#beranda" class="logo">
                <img src="assets/img/logo-KKN-124.png?v=<?= filemtime('assets/img/logo-KKN-124.png') ?>" alt="Logo KKN 124" style="height: 40px; width: auto; object-fit: contain;">
                <div class="logo-text">
                    KKN 124 <span>DESA BOJONG</span>
                </div>
            </a>
            
            <ul class="nav-links">
                <li><a href="#beranda" class="active">Beranda</a></li>
                <li><a href="#anggota">Anggota</a></li>
                <li><a href="#proker">Program Kerja</a></li>
                <li><a href="#galeri">Galeri</a></li>
                <li><a href="#berita">Berita</a></li>
                <li><a href="#lokasi">Lokasi</a></li>
                <li><a href="#kontak" class="btn btn-accent" style="padding: 8px 20px; color: white !important;">Hubungi Kami</a></li>
            </ul>
            
            <div class="menu-toggle" id="mobile-menu-btn">
                <i class="bi bi-list"></i>
            </div>
        </div>
    </nav>

    <!-- ======================================================
         2. BERANDA (HERO SECTION)
         ====================================================== -->
    <section id="beranda" class="hero">
        <div class="container">
            <div class="hero-grid">
                <div class="hero-content reveal">
                    <span class="hero-tag">Kuliah Kerja Nyata (KKN) Kelompok 124</span>
                    <h1>Mengabdi dengan Hati, Membangun Desa Bojong</h1>
                    <p>
                        Kami adalah Kelompok KKN 124 dari Universitas Islam Negeri Profesor Kiai Haji Saifuddin Zuhri Purwokerto yang berdedikasi untuk berkolaborasi dan memberdayakan masyarakat di Desa Bojong, Kecamatan Parigi, Kabupaten Pangandaran.
                    </p>
                    <div class="hero-actions">
                        <a href="#proker" class="btn btn-accent">Lihat Program Kerja <i class="bi bi-arrow-right"></i></a>
                        <a href="#anggota" class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4);">Kenali Tim Kami</a>
                    </div>
                </div>
                <div class="hero-visual reveal-scale delay-2">
                    <div class="hero-circle"></div>
                    <div class="hero-card">
                        <div class="hero-logos-container" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                            <img src="assets/img/logo-KKN-124.png?v=<?= filemtime('assets/img/logo-KKN-124.png') ?>" alt="Logo KKN 124" style="height: 60px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
                           
                        </div>
                        <h3>UIN Saizu Purwokerto</h3>
                        <p>Kelompok KKN 124<br>Desa Bojong - Parigi<br>Kab. Pangandaran</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ======================================================
         3. PROFIL DESA BOJONG & KKN
         ====================================================== -->
    <section class="about-section" style="background-color: var(--bg-white);">
        <div class="container">
            <div class="reveal" style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
                <div>
                    <span class="text-primary" style="font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Tentang Pengabdian Kami</span>
                    <h2 style="font-size: 2.2rem; margin-top: 10px; margin-bottom: 20px; line-height: 1.2;">Membawa Perubahan Melalui Inovasi dan Sinergitas</h2>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        Desa Bojong merupakan salah satu desa di Kecamatan Parigi yang memiliki potensi luar biasa dalam sektor agraris dan UMKM, terutama gula kelapa dan olahan pertanian tradisional. Terletak tidak jauh dari pusat pariwisata Kabupaten Pangandaran, Desa Bojong menawarkan perpaduan kearifan lokal yang khas dan semangat masyarakat yang tinggi.
                    </p>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">
                        Fokus utama KKN 124 UIN Saizu adalah menyelenggarakan program kerja yang berorientasi pada peningkatan daya saing ekonomi mikro (UMKM), penguatan literasi dan keagamaan bagi anak-anak, pendampingan kesehatan masyarakat untuk menurunkan angka stunting, serta pemetaan batas wilayah demi mendukung administrasi desa yang tertib.
                    </p>
                    <div style="display: flex; gap: 24px;">
                        <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 24px;">
                            <h4 style="font-size: 2.5rem; color: var(--primary); font-family: var(--font-heading);"><?= count($anggota_list) ?></h4>
                            <p style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Anggota Kelompok</p>
                        </div>
                        <div style="text-align: center; border-right: 1px solid #e2e8f0; padding-right: 24px;">
                            <h4 style="font-size: 2.5rem; color: var(--primary); font-family: var(--font-heading);"><?= count($proker_list) ?>+</h4>
                            <p style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Pilar Program Kerja</p>
                        </div>
                        <div style="text-align: center; padding-right: 24px;">
                            <h4 style="font-size: 2.5rem; color: var(--primary); font-family: var(--font-heading);"><?= htmlspecialchars($settings['hari_pengabdian']) ?></h4>
                            <p style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Hari Pengabdian</p>
                        </div>
                    </div>
                </div>
                <div style="position: relative;">
                    <div style="border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--card-shadow); border: 8px solid #fff; background: linear-gradient(135deg, #0d9488 0%, #1e1b4b 100%); height: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #fff; padding: 40px;">
                        <i class="bi bi-people-fill" style="font-size: 4rem; color: var(--accent); margin-bottom: 20px;"></i>
                        <h3 style="color: #fff; margin-bottom: 10px;">Gotong Royong & Sinergitas</h3>
                        <p style="font-size: 0.95rem; color: rgba(255,255,255,0.8); max-width: 320px;">Menjunjung tinggi nilai almamater UIN Saizu dalam kehidupan bermasyarakat di Parigi, Pangandaran.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ======================================================
         4. STRUKTUR ANGGOTA SECTION
         ====================================================== -->
    <section id="anggota" class="anggota-section">
        <div class="container">
            <div class="section-header reveal">
                <h2>Struktur Anggota</h2>
                <p>Kenali para mahasiswa KKN 124 UIN Saizu Purwokerto yang mengabdi dan menjalankan program kerja di Desa Bojong.</p>
            </div>
            
            <div class="anggota-grid">
                <?php
                if (empty($anggota_list)):
                ?>
                    <!-- Empty State View -->
                    <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-light); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto;">
                        <i class="bi bi-people" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                        <h4 style="margin-bottom: 10px;">Struktur Anggota Kosong</h4>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">Data struktur pengurus kelompok KKN belum diunggah oleh administrator di panel admin.</p>
                    </div>
                <?php
                else:
                    foreach ($anggota_list as $row):
                        // Generate initials
                        $name_parts = explode(' ', trim($row['nama']));
                        $initials = '';
                        if (count($name_parts) > 1) {
                            $initials = strtoupper(substr($name_parts[0], 0, 1) . substr($name_parts[1], 0, 1));
                        } else {
                            $initials = strtoupper(substr($name_parts[0], 0, 2));
                        }
                        
                        // Cek ketersediaan foto fisik di folder upload
                        $foto_path = 'assets/uploads/anggota/' . $row['foto'];
                        $has_foto = !empty($row['foto']) && file_exists($foto_path) && is_file($foto_path);
                ?>
                    <div class="anggota-card reveal">
                        <div class="avatar-container">
                            <?php if ($has_foto): ?>
                                <img src="<?= $foto_path ?>" alt="<?= htmlspecialchars($row['nama']) ?>" class="avatar-img">
                            <?php else: ?>
                                <div class="avatar-placeholder">
                                    <?= htmlspecialchars($initials) ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        <h3 class="anggota-name"><?= htmlspecialchars($row['nama']) ?></h3>
                        <span class="anggota-role"><?= htmlspecialchars($row['divisi']) ?></span>
                        <p class="anggota-prodi"><i class="bi bi-book-half"></i> <?= htmlspecialchars($row['prodi']) ?></p>
                    </div>
                <?php 
                    endforeach;
                endif; 
                ?>
            </div>
        </div>
    </section>

    <!-- ======================================================
         5. PROGRAM KERJA SECTION
         ====================================================== -->
    <section id="proker" class="proker-section">
        <div class="container">
            <div class="section-header reveal">
                <h2>Program Kerja</h2>
                <p>Beberapa program kerja utama kelompok KKN 124 yang dirancang demi kemajuan ekonomi, sosial, dan infrastruktur Desa Bojong.</p>
            </div>
            
            <div class="proker-grid">
                <?php
                if (empty($proker_list)):
                ?>
                    <!-- Empty State View -->
                    <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-white); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto; box-shadow: var(--card-shadow);">
                        <i class="bi bi-briefcase" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                        <h4 style="margin-bottom: 10px;">Program Kerja Belum Tersedia</h4>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">Daftar program kerja kelompok KKN 124 sedang dirancang dan belum diterbitkan oleh admin.</p>
                    </div>
                <?php
                else:
                    foreach ($proker_list as $row):
                        $icon_class = !empty($row['icon']) ? htmlspecialchars($row['icon']) : 'bi-clipboard';
                        $status = strtolower($row['status']);
                        $status_class = 'status-terencana';
                        if ($status === 'selesai') {
                            $status_class = 'status-selesai';
                        } elseif ($status === 'berjalan') {
                            $status_class = 'status-berjalan';
                        }
                ?>
                    <div class="proker-card reveal">
                        <div class="proker-icon-box">
                            <i class="bi <?= $icon_class ?>"></i>
                        </div>
                        <h3 class="proker-title"><?= htmlspecialchars($row['nama']) ?></h3>
                        <p class="proker-desc"><?= htmlspecialchars($row['deskripsi']) ?></p>
                        <div class="proker-footer">
                            <span class="proker-owner"><?= htmlspecialchars($row['divisi_pelaksana']) ?></span>
                            <span class="proker-status <?= $status_class ?>"><?= htmlspecialchars($row['status']) ?></span>
                        </div>
                    </div>
                <?php 
                    endforeach;
                endif; 
                ?>
            </div>
        </div>
    </section>

    <!-- ======================================================
         6. GALERI SECTION
         ====================================================== -->
    <section id="galeri" class="galeri-section">
        <div class="container">
            <div class="section-header reveal">
                <h2>Galeri Kegiatan</h2>
                <p>Dokumentasi momen gotong royong dan keseruan aktivitas mahasiswa KKN bersama warga Desa Bojong.</p>
            </div>
            
            <div class="galeri-grid">
                <?php
                $galeri_list = get_galeri();
                if (empty($galeri_list)):
                ?>
                    <!-- Empty State View -->
                    <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-light); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto;">
                        <i class="bi bi-camera" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                        <h4 style="margin-bottom: 10px;">Galeri Dokumentasi Kosong</h4>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">Belum ada dokumentasi foto kegiatan pengabdian masyarakat yang diunggah oleh admin.</p>
                    </div>
                <?php
                else:
                    foreach ($galeri_list as $row):
                        $foto_path = 'assets/uploads/galeri/' . $row['foto'];
                        $has_foto = !empty($row['foto']) && file_exists($foto_path) && is_file($foto_path);
                ?>
                    <div class="galeri-card reveal" 
                         data-title="<?= htmlspecialchars($row['judul']) ?>"
                         data-desc="<?= htmlspecialchars($row['deskripsi']) ?>"
                         data-date="<?= htmlspecialchars($row['tanggal']) ?>"
                         data-img="<?= $has_foto ? $foto_path : 'https://picsum.photos/800/600?random=' . rand(1, 100) ?>">
                        
                        <?php if ($has_foto): ?>
                            <div class="galeri-img-wrapper" style="background: url('<?= $foto_path ?>') no-repeat center center; background-size: cover;"></div>
                        <?php else: ?>
                            <div class="galeri-img-fallback">
                                <i class="bi bi-camera"></i>
                                <span><?= htmlspecialchars($row['judul']) ?></span>
                            </div>
                        <?php endif; ?>
                        
                        <div class="galeri-overlay">
                            <h3><?= htmlspecialchars($row['judul']) ?></h3>
                            <p><i class="bi bi-calendar-event"></i> <?= date('d M Y', strtotime($row['tanggal'])) ?></p>
                        </div>
                    </div>
                <?php 
                    endforeach;
                endif; 
                ?>
            </div>
        </div>
    </section>

    <!-- ======================================================
         LIGHTBOX MODAL FOR GALLERY
         ====================================================== -->
    <div id="lightbox" class="lightbox">
        <div class="lightbox-close" id="lightbox-close"><i class="bi bi-x"></i></div>
        <div class="lightbox-content">
            <div class="lightbox-body">
                <div class="lightbox-img-box">
                    <img src="" alt="Detail Dokumentasi KKN" class="lightbox-img">
                </div>
                <div class="lightbox-details">
                    <span class="lightbox-date"></span>
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-desc"></p>
                </div>
            </div>
        </div>
    </div>

    <!-- ======================================================
         7. BERITA (LAPORAN KEGIATAN) SECTION
         ====================================================== -->
    <section id="berita" class="berita-section">
        <div class="container">
            <div class="section-header reveal">
                <h2>Berita & Laporan Kegiatan</h2>
                <p>Ikuti perkembangan terbaru mengenai pelaksanaan program kerja dan berita terbaru seputar KKN Desa Bojong.</p>
            </div>
            
            <div class="berita-grid">
                <?php
                $berita_list = get_berita();
                if (empty($berita_list)):
                ?>
                    <!-- Empty State View -->
                    <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-white); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto; box-shadow: var(--card-shadow);">
                        <i class="bi bi-newspaper" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                        <h4 style="margin-bottom: 10px;">Laporan Berita Kosong</h4>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">Belum ada artikel berita atau rilis laporan kegiatan KKN yang dipublikasikan oleh admin.</p>
                    </div>
                <?php
                else:
                    foreach ($berita_list as $row):
                        $foto_path = 'assets/uploads/berita/' . $row['foto'];
                        $has_foto = !empty($row['foto']) && file_exists($foto_path) && is_file($foto_path);
                        $ringkasan = strip_tags($row['konten']);
                        if (strlen($ringkasan) > 130) {
                            $ringkasan = substr($ringkasan, 0, 130) . '...';
                        }
                ?>
                    <div class="berita-card reveal">
                        <div class="berita-img-box">
                            <?php if ($has_foto): ?>
                                <img src="<?= $foto_path ?>" alt="<?= htmlspecialchars($row['judul']) ?>" style="width: 100%; height: 100%; object-fit: cover;">
                            <?php else: ?>
                                <div class="berita-img-fallback">
                                    <i class="bi bi-newspaper"></i>
                                </div>
                            <?php endif; ?>
                            <span class="berita-date"><i class="bi bi-calendar3"></i> <?= date('d M Y', strtotime($row['tanggal'])) ?></span>
                        </div>
                        <div class="berita-body">
                            <span class="berita-author"><i class="bi bi-person-fill"></i> Oleh: <?= htmlspecialchars($row['penulis']) ?></span>
                            <h3 class="berita-title"><?= htmlspecialchars($row['judul']) ?></h3>
                            <p class="berita-excerpt"><?= htmlspecialchars($ringkasan) ?></p>
                            <a href="#kontak" class="berita-link">Hubungi Kami / Detail <i class="bi bi-chevron-right"></i></a>
                        </div>
                    </div>
                <?php 
                    endforeach;
                endif; 
                ?>
            </div>
        </div>
    </section>

    <!-- ======================================================
         8. LOKASI MAPS SECTION
         ====================================================== -->
    <section id="lokasi" class="lokasi-section">
        <div class="container">
            <div class="section-header reveal">
                <h2>Lokasi Pengabdian</h2>
                <p>Desa Bojong terletak di wilayah strategis Kecamatan Parigi, Pangandaran. Berikut adalah titik lokasi pusat posko kami.</p>
            </div>
            
            <div class="lokasi-grid">
                <div class="lokasi-info reveal">
                    <h3>Posko KKN 124 Desa Bojong</h3>
                    <p>Posko utama kami berlokasi strategis di area pusat administrasi desa, memudahkan komunikasi dan koordinasi program dengan perangkat desa dan warga sekitar.</p>
                    
                    <ul class="lokasi-list">
                        <li>
                            <i class="bi bi-geo-alt"></i>
                            <div>
                                <h4>Alamat Posko</h4>
                                <p><?= htmlspecialchars($settings['alamat_posko']) ?></p>
                            </div>
                        </li>
                        <li>
                            <i class="bi bi-mortarboard"></i>
                            <div>
                                <h4>Kampus Asal</h4>
                                <p>UIN Prof. K.H. Saifuddin Zuhri, Purwokerto, Jl. Jend. A. Yani No.40A</p>
                            </div>
                        </li>
                        <li>
                            <i class="bi bi-envelope"></i>
                            <div>
                                <h4>Email Resmi</h4>
                                <p><?= htmlspecialchars($settings['email']) ?></p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="map-wrapper reveal-scale delay-2">
                    <iframe src="<?= htmlspecialchars($settings['map_embed']) ?>" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
        </div>
    </section>

    <!-- ======================================================
         9. KONTAK SECTION
         ====================================================== -->
    <section id="kontak" class="kontak-section">
        <div class="container">
            <div class="kontak-grid">
                <div class="kontak-details reveal">
                    <h3>Hubungi KKN 124</h3>
                    <p>Punya pertanyaan mengenai program kerja kami, tawaran kolaborasi, atau ingin memberikan masukan konstruktif? Silakan kirimkan pesan kepada kami melalui formulir.</p>
                    
                    <ul class="kontak-info-list">
                        <li>
                            <i class="bi bi-telephone-fill"></i>
                            <div>
                                <h5>WhatsApp Posko</h5>
                                <p><?= htmlspecialchars($settings['whatsapp']) ?></p>
                            </div>
                        </li>
                        <li>
                            <i class="bi bi-instagram"></i>
                            <div>
                                <h5>Instagram Resmi</h5>
                                <p><?= htmlspecialchars($settings['instagram']) ?></p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="kontak-card reveal-scale delay-2">
                    <div id="form-alert" class="form-alert"></div>
                    
                    <form id="contact-form" method="POST" action="submit_pesan.php">
                        <div class="form-group">
                            <label for="nama" class="form-label">Nama Lengkap</label>
                            <input type="text" id="nama" name="nama" class="form-control" placeholder="Masukkan nama Anda" required>
                        </div>
                        <div class="form-group">
                            <label for="email" class="form-label">Alamat Email</label>
                            <input type="email" id="email" name="email" class="form-control" placeholder="contoh@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="subjek" class="form-label">Subjek</label>
                            <input type="text" id="subjek" name="subjek" class="form-control" placeholder="Topik pesan" required>
                        </div>
                        <div class="form-group">
                            <label for="pesan" class="form-label">Pesan Anda</label>
                            <textarea id="pesan" name="pesan" class="form-control" placeholder="Tuliskan pesan detail..." required></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-accent" style="width: 100%;">
                            <span class="btn-text">Kirim Pesan</span>
                            <span class="spinner"></span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- ======================================================
         10. FOOTER SECTION
         ====================================================== -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <h4>KKN 124 UIN Saizu Desa Bojong</h4>
                    <p>
                        Kelompok pengabdian Kuliah Kerja Nyata (KKN) angkatan ke-124 Desa Bojong, Kec. Parigi, Kab. Pangandaran. Bertekad mendampingi, mengedukasi, dan memajukan kemandirian desa secara inklusif dan berkelanjutan.
                    </p>
                    <div class="social-links">
                        <a href="https://instagram.com" target="_blank"><i class="bi bi-instagram"></i></a>
                        <a href="https://youtube.com" target="_blank"><i class="bi bi-youtube"></i></a>
                        <a href="https://github.com" target="_blank"><i class="bi bi-envelope-fill"></i></a>
                    </div>
                </div>
                
                <div class="footer-links">
                    <h4>Navigasi Cepat</h4>
                    <ul>
                        <li><a href="#beranda"><i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i> Beranda</a></li>
                        <li><a href="#anggota"><i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i> Struktur Anggota</a></li>
                        <li><a href="#proker"><i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i> Program Kerja</a></li>
                        <li><a href="#galeri"><i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i> Galeri Kegiatan</a></li>
                        <li><a href="#berita"><i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i> Berita Laporan</a></li>
                    </ul>
                </div>
                
                <div class="footer-instagram">
                    <h4>Akses Internal</h4>
                    <p style="font-size: 0.9rem; line-height: 1.6; margin-bottom: 12px;">
                        Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)
                    </p>
                    <p style="font-size: 0.85rem; font-weight: 700;">
                        UIN Prof. K.H. Saifuddin Zuhri Purwokerto
                    </p>
                    <a href="login.php" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 15px; font-size: 0.85rem; color: var(--accent); font-weight: 700;">
                        <i class="bi bi-lock-fill"></i> Login Dashboard Admin
                    </a>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2026 KKN 124 Desa Bojong. Hak Cipta Dilindungi Undang-Undang.</p>
                <p>Dibuat dengan <i class="bi bi-heart-fill text-accent" style="color: var(--accent);"></i> untuk Parigi, Pangandaran.</p>
            </div>
        </div>
    </footer>

    <!-- Master JS Script -->
    <script src="assets/js/script.js"></script>
</body>
</html>
