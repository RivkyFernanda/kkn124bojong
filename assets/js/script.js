/**
 * script.js
 * JavaScript untuk Website KKN 124 Desa Bojong
 * Mengontrol navigasi, animasi scroll, galeri modal, dan AJAX kontak form.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 1. DYNAMIC NAVBAR SCROLL EFFECT
    // ======================================================
    const navbar = document.querySelector('.navbar');
    
    const handleNavbarScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Jalankan sekali saat load halaman awal

    // ======================================================
    // 2. MOBILE MENU TOGGLE
    // ======================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Ganti icon hamburger / close
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.className = 'bi bi-x-lg';
                } else {
                    icon.className = 'bi bi-list';
                }
            }
        });

        // Tutup menu mobile ketika link di-klik
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'bi bi-list';
                }
            });
        });
    }

    // ======================================================
    // 3. ACTIVE MENU ITEM ON SCROLL
    // ======================================================
    const sections = document.querySelectorAll('section');
    const navLinksList = document.querySelectorAll('.nav-links a');

    const highlightActiveMenu = () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150; // offset navbar
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinksList.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', highlightActiveMenu);

    // ======================================================
    // 4. ANIMASI REVEAL ON SCROLL (INTERSECTION OBSERVER)
    // ======================================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // viewport
            threshold: 0.15, // elemen 15% terlihat
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Cukup animasi sekali
                }
            });
        }, observerOptions);

        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback jika browser lawas tidak dukung Intersection Observer
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }

    // ======================================================
    // 5. LIGHTBOX MODAL GALERI
    // ======================================================
    const galeriCards = document.querySelectorAll('.galeri-card');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    
    if (lightbox && galeriCards.length > 0) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxTitle = lightbox.querySelector('.lightbox-title');
        const lightboxDate = lightbox.querySelector('.lightbox-date');
        const lightboxDesc = lightbox.querySelector('.lightbox-desc');

        galeriCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const date = card.getAttribute('data-date');
                const imgSrc = card.getAttribute('data-img');

                // Set content di modal
                if (lightboxImg) lightboxImg.src = imgSrc;
                if (lightboxTitle) lightboxTitle.textContent = title;
                if (lightboxDate) lightboxDate.textContent = formatDate(date);
                if (lightboxDesc) lightboxDesc.textContent = desc;

                // Tampilkan lightbox
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock scroll body
            });
        });

        // Tutup modal
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Unlock scroll body
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // Helper format tanggal Indonesia (YYYY-MM-DD -> DD Month YYYY)
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return dateStr;
        
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${day} ${month} ${year}`;
    }

    // ======================================================
    // 6. FORM HUBUNGI KAMI AJAX SUBMISSION
    // ======================================================
    const contactForm = document.getElementById('contact-form');
    const formAlert = document.getElementById('form-alert');
    
    if (contactForm && formAlert) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Mencegah reload halaman

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const spinner = submitBtn.querySelector('.spinner');

            // Ambil data form
            const formData = new FormData(contactForm);

            // Tampilkan state loading
            submitBtn.disabled = true;
            if (btnText) btnText.style.opacity = '0.5';
            if (spinner) spinner.style.display = 'inline-block';

            // Sembunyikan alert sebelumnya
            formAlert.className = 'form-alert';
            formAlert.style.display = 'none';

            // Kirim request AJAX ke submit_pesan.php
            fetch('submit_pesan.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Respons server tidak stabil.');
                }
                return response.json();
            })
            .then(data => {
                // Tampilkan feedback alert
                formAlert.textContent = data.message;
                if (data.status === 'success') {
                    formAlert.classList.add('success');
                    contactForm.reset(); // Bersihkan isi form jika sukses
                } else {
                    formAlert.classList.add('error');
                }
                formAlert.style.display = 'block';
            })
            .catch(error => {
                formAlert.textContent = 'Terjadi kegagalan jaringan: ' + error.message;
                formAlert.classList.add('error');
                formAlert.style.display = 'block';
            })
            .finally(() => {
                // Kembalikan state tombol
                submitBtn.disabled = false;
                if (btnText) btnText.style.opacity = '1';
                if (spinner) spinner.style.display = 'none';
            });
        });
    }

});
