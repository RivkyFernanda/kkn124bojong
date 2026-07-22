import { db } from './firebase.js';
import { ref, get, child, push, set } from 'firebase/database';

// DOM Elements
const statAnggota = document.getElementById('stat-anggota');
const statProker = document.getElementById('stat-proker');
const statHari = document.getElementById('stat-hari');
const alamatPosko = document.getElementById('alamat-posko');
const emailResmi = document.getElementById('email-resmi');
const mapIframe = document.getElementById('map-iframe');
const whatsappPosko = document.getElementById('whatsapp-posko');
const instagramPosko = document.getElementById('instagram-posko');

// Helper to determine image URL (supports local fallback and firebase cloud URL)
function getImageUrl(filename, type) {
    if (!filename) return '';
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    return `assets/uploads/${type}/${filename}`;
}

// Date formatter
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', options);
    } catch (e) {
        return dateString;
    }
}

// Open Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxDate = lightbox.querySelector('.lightbox-date');
const lightboxTitle = lightbox.querySelector('.lightbox-title');
const lightboxDesc = lightbox.querySelector('.lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(title, desc, date, imgUrl) {
    lightboxImg.src = imgUrl;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;
    lightboxDate.innerHTML = `<i class="bi bi-calendar-event"></i> ${formatDate(date)}`;
    lightbox.classList.add('active');
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });
}
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
}

// 1. LOAD SETTINGS
async function loadSettings() {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'pengaturan'));
        let settings = {
            alamat_posko: 'Jln. Citumang RT03/RW03 Dusun Sukasari, Desa Bojong, Kec. Parigi, Kabupaten Pangandaran, Jawa Barat 46393',
            map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5358043689456!2d108.53032731477764!3d-7.732847994426217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e65bcf44ebbd7af%3A0xe5a3cbeecb5ce53!2sBojong%2C%20Parigi%2C%20Pangandaran%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1680000000000!5m2!1sen!2sid',
            email: 'kkn124.bojong@saizu.ac.id',
            whatsapp: '+62 823-2412-2026',
            instagram: '@diary.bojong124',
            hari_pengabdian: '40'
        };
        
        if (snapshot.exists()) {
            settings = { ...settings, ...snapshot.val() };
        } else {
            // Write defaults to database if empty
            await set(ref(db, 'pengaturan'), settings);
        }
        
        // Populate settings in UI
        if (statHari) statHari.textContent = settings.hari_pengabdian;
        if (alamatPosko) alamatPosko.textContent = settings.alamat_posko;
        if (emailResmi) emailResmi.textContent = settings.email;
        if (mapIframe) mapIframe.src = settings.map_embed;
        if (whatsappPosko) whatsappPosko.textContent = settings.whatsapp;
        if (instagramPosko) instagramPosko.textContent = settings.instagram;
    } catch (error) {
        console.error("Error loading settings: ", error);
    }
}

// 2. LOAD ANGGOTA
const anggotaContainer = document.getElementById('anggota-container');
async function loadAnggota() {
    if (!anggotaContainer) return;
    try {
        const snapshot = await get(ref(db, 'anggota'));
        anggotaContainer.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach((childSnapshot) => {
                data.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            
            // Sort by urutan ascending
            data.sort((a, b) => (parseInt(a.urutan) || 0) - (parseInt(b.urutan) || 0));
            
            if (statAnggota) statAnggota.textContent = data.length;
            
            data.forEach(row => {
                const nameParts = row.nama.trim().split(' ');
                const initials = nameParts.length > 1 
                    ? (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
                    : nameParts[0].substring(0, 2).toUpperCase();
                
                const fotoUrl = getImageUrl(row.foto, 'anggota');
                const card = document.createElement('div');
                card.className = 'anggota-card reveal';
                
                let avatarHtml = `<div class="avatar-placeholder">${initials}</div>`;
                if (row.foto) {
                    avatarHtml = `<img src="${fotoUrl}" alt="${row.nama}" class="avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                  <div class="avatar-placeholder" style="display:none;">${initials}</div>`;
                }
                
                card.innerHTML = `
                    <div class="avatar-container">
                        ${avatarHtml}
                    </div>
                    <h3 class="anggota-name">${row.nama}</h3>
                    <span class="anggota-role">${row.divisi}</span>
                    <p class="anggota-prodi"><i class="bi bi-book-half"></i> ${row.prodi}</p>
                `;
                anggotaContainer.appendChild(card);
            });
        } else {
            if (statAnggota) statAnggota.textContent = '0';
            anggotaContainer.innerHTML = `
                <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-light); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto;">
                    <i class="bi bi-people" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                    <h4 style="margin-bottom: 10px;">Struktur Anggota Empty</h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Data struktur pengurus kelompok KKN belum diunggah oleh administrator di panel admin.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error loading anggota: ", err);
    }
}

// 3. LOAD PROGRAM KERJA
const prokerContainer = document.getElementById('proker-container');
async function loadProker() {
    if (!prokerContainer) return;
    try {
        const snapshot = await get(ref(db, 'program_kerja'));
        prokerContainer.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            
            if (statProker) statProker.textContent = data.length + '+';
            
            data.forEach(row => {
                const icon = row.icon || 'bi-clipboard';
                const status = (row.status || '').toLowerCase();
                let statusClass = 'status-terencana';
                if (status === 'selesai') statusClass = 'status-selesai';
                else if (status === 'berjalan') statusClass = 'status-berjalan';
                
                const card = document.createElement('div');
                card.className = 'proker-card reveal';
                card.innerHTML = `
                    <div class="proker-icon-box">
                        <i class="bi ${icon}"></i>
                    </div>
                    <h3 class="proker-title">${row.nama}</h3>
                    <p class="proker-desc">${row.deskripsi}</p>
                    <div class="proker-footer">
                        <span class="proker-owner">${row.divisi_pelaksana}</span>
                        <span class="proker-status ${statusClass}">${row.status}</span>
                    </div>
                `;
                prokerContainer.appendChild(card);
            });
        } else {
            if (statProker) statProker.textContent = '0+';
            prokerContainer.innerHTML = `
                <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-white); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto; box-shadow: var(--card-shadow);">
                    <i class="bi bi-briefcase" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                    <h4 style="margin-bottom: 10px;">Program Kerja Belum Tersedia</h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Daftar program kerja kelompok KKN 124 sedang dirancang dan belum diterbitkan oleh admin.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error loading proker: ", err);
    }
}

// 4. LOAD GALERI
const galeriContainer = document.getElementById('galeri-container');
async function loadGaleri() {
    if (!galeriContainer) return;
    try {
        const snapshot = await get(ref(db, 'galeri'));
        galeriContainer.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            // Sort by tanggal desc
            data.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
            
            data.forEach(row => {
                const fotoUrl = getImageUrl(row.foto, 'galeri');
                const card = document.createElement('div');
                card.className = 'galeri-card reveal';
                
                const dateStr = formatDate(row.tanggal);
                
                card.innerHTML = `
                    <div class="galeri-img-wrapper" style="background: url('${fotoUrl}') no-repeat center center; background-size: cover;"></div>
                    <div class="galeri-overlay">
                        <h3>${row.judul}</h3>
                        <p><i class="bi bi-calendar-event"></i> ${dateStr}</p>
                    </div>
                `;
                
                card.addEventListener('click', () => openLightbox(row.judul, row.deskripsi, row.tanggal, fotoUrl));
                galeriContainer.appendChild(card);
            });
        } else {
            galeriContainer.innerHTML = `
                <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-light); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto;">
                    <i class="bi bi-camera" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                    <h4 style="margin-bottom: 10px;">Galeri Dokumentasi Kosong</h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Belum ada dokumentasi foto kegiatan pengabdian masyarakat yang diunggah oleh admin.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error loading galeri: ", err);
    }
}

// 5. LOAD BERITA
const beritaContainer = document.getElementById('berita-container');
async function loadBerita() {
    if (!beritaContainer) return;
    try {
        const snapshot = await get(ref(db, 'berita'));
        beritaContainer.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            // Sort by tanggal desc
            data.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
            
            data.forEach(row => {
                const fotoUrl = getImageUrl(row.foto, 'berita');
                let ringkasan = row.konten || '';
                if (ringkasan.length > 130) {
                    ringkasan = ringkasan.substring(0, 130) + '...';
                }
                
                const card = document.createElement('div');
                card.className = 'berita-card reveal';
                
                let imageHtml = `<div class="berita-img-fallback"><i class="bi bi-newspaper"></i></div>`;
                if (row.foto) {
                    imageHtml = `<img src="${fotoUrl}" alt="${row.judul}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                
                card.innerHTML = `
                    <div class="berita-img-box">
                        ${imageHtml}
                        <span class="berita-date"><i class="bi bi-calendar3"></i> ${formatDate(row.tanggal)}</span>
                    </div>
                    <div class="berita-body">
                        <span class="berita-author"><i class="bi bi-person-fill"></i> Oleh: ${row.penulis}</span>
                        <h3 class="berita-title">${row.judul}</h3>
                        <p class="berita-excerpt">${ringkasan}</p>
                        <a href="#kontak" class="berita-link">Hubungi Kami / Detail <i class="bi bi-chevron-right"></i></a>
                    </div>
                `;
                beritaContainer.appendChild(card);
            });
        } else {
            beritaContainer.innerHTML = `
                <div class="reveal text-center" style="grid-column: 1 / -1; padding: 60px 40px; background-color: var(--bg-white); border: 2px dashed rgba(15, 118, 110, 0.15); border-radius: var(--radius-md); max-width: 600px; margin: 0 auto; box-shadow: var(--card-shadow);">
                    <i class="bi bi-newspaper" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 15px; display: block;"></i>
                    <h4 style="margin-bottom: 10px;">Laporan Berita Kosong</h4>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Belum ada artikel berita atau rilis laporan kegiatan KKN yang dipublikasikan oleh admin.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Error loading berita: ", err);
    }
}

// 6. CONTACT FORM SUBMIT HANDLER
const contactForm = document.getElementById('contact-form');
const formAlert = document.getElementById('form-alert');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        const nama = document.getElementById('nama').value.trim();
        const email = document.getElementById('email').value.trim();
        const subjek = document.getElementById('subjek').value.trim();
        const pesan = document.getElementById('pesan').value.trim();
        
        if (formAlert) {
            formAlert.className = 'form-alert';
            formAlert.innerHTML = '';
        }
        
        try {
            const messagesRef = ref(db, 'pesan');
            const newMessageRef = push(messagesRef);
            await set(newMessageRef, {
                nama,
                email,
                subjek,
                pesan,
                tanggal: new Date().toISOString()
            });
            
            if (formAlert) {
                formAlert.classList.add('success');
                formAlert.innerHTML = `<i class="bi bi-check-circle-fill"></i> Terima kasih! Pesan Anda telah berhasil dikirim dan disimpan di Firebase.`;
            }
            contactForm.reset();
        } catch (error) {
            console.error("Error sending message: ", error);
            if (formAlert) {
                formAlert.classList.add('error');
                formAlert.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Terjadi kesalahan sistem saat mengirimkan pesan. Silakan coba lagi.`;
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadAnggota();
    loadProker();
    loadGaleri();
    loadBerita();
});
