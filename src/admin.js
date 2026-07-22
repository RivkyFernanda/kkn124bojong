import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, get, set, push, remove, update } from 'firebase/database';
import { ref as refStorage, uploadBytes, getDownloadURL } from 'firebase/storage';

// 1. ROUTE PROTECTION (Anti-bypass)
if (!sessionStorage.getItem('admin_session_active')) {
    window.location.href = 'login.html';
}

// 2. AUTHENTICATION WATCHER
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    if (!user) {
        sessionStorage.removeItem('admin_session_active');
        window.location.href = 'login.html';
    } else {
        currentUser = user;
        const adminEmailDisplay = document.getElementById('admin-username-display');
        if (adminEmailDisplay) {
            // Display email username part
            adminEmailDisplay.textContent = user.email.split('@')[0];
        }
        // Initialize dashboard loading
        loadAllData();
    }
});

// Logout Handler
const logoutBtn = document.getElementById('admin-logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar dari Panel Admin?")) {
            try {
                await signOut(auth);
                sessionStorage.removeItem('admin_session_active');
                window.location.href = 'login.html';
            } catch (err) {
                console.error("Logout failed: ", err);
            }
        }
    });
}

// 3. SPA ROUTER (Hash Navigation)
const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
const tabPanels = document.querySelectorAll('.tab-panel');

function handleRouting() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    
    // Switch Active Menu
    menuItems.forEach(item => {
        if (item.getAttribute('data-tab') === hash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Switch Active Tab Panel
    tabPanels.forEach(panel => {
        if (panel.id === `tab-${hash}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Close any open forms and return to lists when shifting tabs
    closeAllForms();
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

function closeAllForms() {
    document.querySelectorAll('[id$="-form-view"]').forEach(formView => {
        formView.style.display = 'none';
    });
    document.querySelectorAll('[id$="-list-view"]').forEach(listView => {
        listView.style.display = 'block';
    });
    // Reset forms
    document.querySelectorAll('form').forEach(form => {
        if (form.id !== 'form-pengaturan' && form.id !== 'form-ganti-sandi') {
            form.reset();
        }
    });
    // Hide preview links
    document.querySelectorAll('[id$="-preview-container"]').forEach(preview => {
        preview.style.display = 'none';
    });
}

// Global Alert Handler
function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('global-alert');
    if (alertBox) {
        alertBox.className = `alert alert-${type}`;
        alertBox.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}"></i> <span>${message}</span>`;
        alertBox.style.display = 'flex';
        
        // Scroll to top of main wrapper to see alert
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }
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

// 4. FILE UPLOAD TO FIREBASE STORAGE
async function uploadToStorage(file, folder) {
    if (!file) return null;
    const uniqueFilename = `${folder}_${Date.now()}_${Math.floor(Math.random() * 10000)}_${file.name}`;
    const storageRef = refStorage(storage, `uploads/${folder}/${uniqueFilename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

// 5. GLOBAL CRUD CONTROLLER IMPLEMENTATIONS

// Setup Form Toggle Listeners
document.querySelectorAll('.btn-add-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const module = btn.getAttribute('data-module');
        document.getElementById(`${module}-list-view`).style.display = 'none';
        document.getElementById(`${module}-form-view`).style.display = 'block';
        
        // Reset form inputs & set title
        const form = document.getElementById(`form-${module}`);
        if (form) form.reset();
        
        const hiddenId = document.getElementById(`${module}-id`);
        if (hiddenId) hiddenId.value = '';
        
        const title = document.getElementById(`${module}-form-title`);
        if (title) {
            title.textContent = module === 'anggota' ? 'Tambah Anggota Baru' :
                                module === 'proker' ? 'Tambah Program Kerja' :
                                module === 'galeri' ? 'Tambah Dokumentasi Baru' : 'Tulis Berita / Laporan Baru';
        }
        
        const preview = document.getElementById(`${module}-foto-preview-container`);
        if (preview) preview.style.display = 'none';
    });
});

document.querySelectorAll('.btn-cancel-form').forEach(btn => {
    btn.addEventListener('click', () => {
        const module = btn.getAttribute('data-module');
        closeAllForms();
    });
});

// Load All Data Coordinator
function loadAllData() {
    loadDashboardStats();
    loadAnggotaList();
    loadProkerList();
    loadGaleriList();
    loadBeritaList();
    loadPesanList();
    loadSettingsForm();
}

// Dashboard statistics
async function loadDashboardStats() {
    try {
        const [anggota, proker, galeri, berita, pesan] = await Promise.all([
            get(ref(db, 'anggota')),
            get(ref(db, 'program_kerja')),
            get(ref(db, 'galeri')),
            get(ref(db, 'berita')),
            get(ref(db, 'pesan'))
        ]);
        
        const count = (snap) => snap.exists() ? Object.keys(snap.val()).length : 0;
        
        document.getElementById('dash-count-anggota').textContent = count(anggota);
        document.getElementById('dash-count-proker').textContent = count(proker);
        document.getElementById('dash-count-galeri').textContent = count(galeri);
        document.getElementById('dash-count-berita').textContent = count(berita);
        document.getElementById('dash-count-pesan').textContent = count(pesan);
    } catch (err) {
        console.error("Stats fetch error: ", err);
    }
}

// -------------------------------------------------------------------------
// ANGGOTA MODULE
// -------------------------------------------------------------------------
const tableAnggota = document.getElementById('table-body-anggota');
async function loadAnggotaList() {
    if (!tableAnggota) return;
    try {
        const snapshot = await get(ref(db, 'anggota'));
        tableAnggota.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            data.sort((a, b) => (parseInt(a.urutan) || 0) - (parseInt(b.urutan) || 0));
            
            data.forEach(row => {
                const tr = document.createElement('tr');
                const fotoHtml = row.foto 
                    ? `<img src="${row.foto}" alt="Foto" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`
                    : `<div style="width: 44px; height: 44px; border-radius: 50%; background-color: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">NA</div>`;
                
                tr.innerHTML = `
                    <td><strong>${row.urutan}</strong></td>
                    <td><strong>${row.nama}</strong></td>
                    <td><span class="badge badge-green">${row.divisi}</span></td>
                    <td>${row.prodi}</td>
                    <td>${fotoHtml}</td>
                    <td class="actions-cell" style="justify-content: center;">
                        <button class="action-link action-edit edit-anggota-btn" data-id="${row.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                        <button class="action-link action-delete delete-anggota-btn" data-id="${row.id}"><i class="bi bi-trash"></i> Hapus</button>
                    </td>
                `;
                tableAnggota.appendChild(tr);
            });
            
            // Bind edit/delete actions
            document.querySelectorAll('.edit-anggota-btn').forEach(btn => {
                btn.addEventListener('click', () => editAnggota(btn.getAttribute('data-id')));
            });
            document.querySelectorAll('.delete-anggota-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteAnggota(btn.getAttribute('data-id')));
            });
        } else {
            tableAnggota.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">Belum ada data anggota kelompok.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function editAnggota(id) {
    try {
        const snap = await get(ref(db, `anggota/${id}`));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById('anggota-id').value = id;
            document.getElementById('anggota-nama').value = data.nama;
            document.getElementById('anggota-urutan').value = data.urutan;
            document.getElementById('anggota-divisi').value = data.divisi;
            document.getElementById('anggota-prodi').value = data.prodi;
            
            document.getElementById('anggota-form-title').textContent = 'Edit Data Anggota';
            document.getElementById('anggota-submit-text').textContent = 'Simpan Perubahan';
            
            const preview = document.getElementById('anggota-foto-preview-container');
            const previewLink = document.getElementById('anggota-foto-preview-link');
            if (data.foto && preview && previewLink) {
                previewLink.href = data.foto;
                previewLink.textContent = data.foto;
                preview.style.display = 'block';
            } else if (preview) {
                preview.style.display = 'none';
            }
            
            document.getElementById('anggota-list-view').style.display = 'none';
            document.getElementById('anggota-form-view').style.display = 'block';
        }
    } catch (err) {
        showAlert("Gagal mengambil data anggota: " + err.message, "error");
    }
}

async function deleteAnggota(id) {
    if (confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
        try {
            await remove(ref(db, `anggota/${id}`));
            showAlert("Anggota berhasil dihapus.");
            loadAllData();
        } catch (err) {
            showAlert("Gagal menghapus anggota: " + err.message, "error");
        }
    }
}

const formAnggota = document.getElementById('form-anggota');
if (formAnggota) {
    formAnggota.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formAnggota.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const id = document.getElementById('anggota-id').value;
        const nama = document.getElementById('anggota-nama').value.trim();
        const urutan = parseInt(document.getElementById('anggota-urutan').value) || 0;
        const divisi = document.getElementById('anggota-divisi').value.trim();
        const prodi = document.getElementById('anggota-prodi').value.trim();
        const fileInput = document.getElementById('anggota-foto');
        
        try {
            let fotoUrl = null;
            if (id) {
                // If edit, fetch old photo url first
                const snap = await get(ref(db, `anggota/${id}/foto`));
                if (snap.exists()) fotoUrl = snap.val();
            }
            
            if (fileInput.files.length > 0) {
                fotoUrl = await uploadToStorage(fileInput.files[0], 'anggota');
            }
            
            const payload = { nama, urutan, divisi, prodi, foto: fotoUrl };
            
            if (id) {
                await update(ref(db, `anggota/${id}`), payload);
                showAlert("Data anggota berhasil diperbarui.");
            } else {
                await push(ref(db, 'anggota'), payload);
                showAlert("Anggota baru berhasil ditambahkan.");
            }
            
            closeAllForms();
            loadAllData();
        } catch (err) {
            showAlert("Gagal menyimpan data anggota: " + err.message, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// -------------------------------------------------------------------------
// PROGRAM KERJA MODULE
// -------------------------------------------------------------------------
const tableProker = document.getElementById('table-body-proker');
async function loadProkerList() {
    if (!tableProker) return;
    try {
        const snapshot = await get(ref(db, 'program_kerja'));
        tableProker.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            
            data.forEach(row => {
                const tr = document.createElement('tr');
                const status = (row.status || '').toLowerCase();
                let statusColor = 'badge-orange';
                if (status === 'selesai') statusColor = 'badge-green';
                else if (status === 'berjalan') statusColor = 'badge-blue';
                
                tr.innerHTML = `
                    <td style="text-align: center; font-size: 1.3rem;"><i class="bi ${row.icon || 'bi-clipboard'}"></i></td>
                    <td><strong>${row.nama}</strong></td>
                    <td>${row.divisi_pelaksana}</td>
                    <td><span class="badge ${statusColor}">${row.status}</span></td>
                    <td class="actions-cell" style="justify-content: center;">
                        <button class="action-link action-edit edit-proker-btn" data-id="${row.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                        <button class="action-link action-delete delete-proker-btn" data-id="${row.id}"><i class="bi bi-trash"></i> Hapus</button>
                    </td>
                `;
                tableProker.appendChild(tr);
            });
            
            document.querySelectorAll('.edit-proker-btn').forEach(btn => {
                btn.addEventListener('click', () => editProker(btn.getAttribute('data-id')));
            });
            document.querySelectorAll('.delete-proker-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteProker(btn.getAttribute('data-id')));
            });
        } else {
            tableProker.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Belum ada data program kerja.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function editProker(id) {
    try {
        const snap = await get(ref(db, `program_kerja/${id}`));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById('proker-id').value = id;
            document.getElementById('proker-nama').value = data.nama;
            document.getElementById('proker-divisi').value = data.divisi_pelaksana;
            document.getElementById('proker-status').value = data.status;
            document.getElementById('proker-icon').value = data.icon;
            document.getElementById('proker-deskripsi').value = data.deskripsi;
            
            document.getElementById('proker-form-title').textContent = 'Edit Program Kerja';
            document.getElementById('proker-submit-text').textContent = 'Simpan Perubahan';
            
            document.getElementById('proker-list-view').style.display = 'none';
            document.getElementById('proker-form-view').style.display = 'block';
        }
    } catch (err) {
        showAlert("Gagal mengambil data proker: " + err.message, "error");
    }
}

async function deleteProker(id) {
    if (confirm("Apakah Anda yakin ingin menghapus program kerja ini?")) {
        try {
            await remove(ref(db, `program_kerja/${id}`));
            showAlert("Program kerja berhasil dihapus.");
            loadAllData();
        } catch (err) {
            showAlert("Gagal menghapus proker: " + err.message, "error");
        }
    }
}

const formProker = document.getElementById('form-proker');
if (formProker) {
    formProker.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formProker.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const id = document.getElementById('proker-id').value;
        const nama = document.getElementById('proker-nama').value.trim();
        const divisi_pelaksana = document.getElementById('proker-divisi').value.trim();
        const status = document.getElementById('proker-status').value;
        const icon = document.getElementById('proker-icon').value.trim();
        const deskripsi = document.getElementById('proker-deskripsi').value.trim();
        
        const payload = { nama, divisi_pelaksana, status, icon, deskripsi };
        
        try {
            if (id) {
                await update(ref(db, `program_kerja/${id}`), payload);
                showAlert("Program kerja berhasil diperbarui.");
            } else {
                await push(ref(db, 'program_kerja'), payload);
                showAlert("Program kerja baru berhasil ditambahkan.");
            }
            closeAllForms();
            loadAllData();
        } catch (err) {
            showAlert("Gagal menyimpan program kerja: " + err.message, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// -------------------------------------------------------------------------
// GALERI MODULE
// -------------------------------------------------------------------------
const tableGaleri = document.getElementById('table-body-galeri');
async function loadGaleriList() {
    if (!tableGaleri) return;
    try {
        const snapshot = await get(ref(db, 'galeri'));
        tableGaleri.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            data.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
            
            data.forEach(row => {
                const tr = document.createElement('tr');
                const fotoHtml = row.foto 
                    ? `<img src="${row.foto}" alt="Foto" style="width: 60px; height: 45px; border-radius: var(--radius-sm); object-fit: cover;">`
                    : `<div style="width: 60px; height: 45px; border-radius: var(--radius-sm); background-color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #64748b;">KOSONG</div>`;
                
                const descStr = (row.deskripsi || '').length > 60 ? row.deskripsi.substring(0, 60) + '...' : row.deskripsi;
                
                tr.innerHTML = `
                    <td>${fotoHtml}</td>
                    <td><strong>${row.judul}</strong></td>
                    <td>${formatDate(row.tanggal)}</td>
                    <td><span style="font-size: 0.85rem; color: #64748b;">${descStr}</span></td>
                    <td class="actions-cell" style="justify-content: center;">
                        <button class="action-link action-edit edit-galeri-btn" data-id="${row.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                        <button class="action-link action-delete delete-galeri-btn" data-id="${row.id}"><i class="bi bi-trash"></i> Hapus</button>
                    </td>
                `;
                tableGaleri.appendChild(tr);
            });
            
            document.querySelectorAll('.edit-galeri-btn').forEach(btn => {
                btn.addEventListener('click', () => editGaleri(btn.getAttribute('data-id')));
            });
            document.querySelectorAll('.delete-galeri-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteGaleri(btn.getAttribute('data-id')));
            });
        } else {
            tableGaleri.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Belum ada data dokumentasi.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function editGaleri(id) {
    try {
        const snap = await get(ref(db, `galeri/${id}`));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById('galeri-id').value = id;
            document.getElementById('galeri-judul').value = data.judul;
            document.getElementById('galeri-tanggal').value = data.tanggal;
            document.getElementById('galeri-deskripsi').value = data.deskripsi;
            
            document.getElementById('galeri-form-title').textContent = 'Edit Dokumentasi Galeri';
            document.getElementById('galeri-submit-text').textContent = 'Simpan Perubahan';
            
            const preview = document.getElementById('galeri-foto-preview-container');
            const previewLink = document.getElementById('galeri-foto-preview-link');
            if (data.foto && preview && previewLink) {
                previewLink.href = data.foto;
                previewLink.textContent = data.foto;
                preview.style.display = 'block';
            } else if (preview) {
                preview.style.display = 'none';
            }
            
            document.getElementById('galeri-list-view').style.display = 'none';
            document.getElementById('galeri-form-view').style.display = 'block';
        }
    } catch (err) {
        showAlert("Gagal mengambil data galeri: " + err.message, "error");
    }
}

async function deleteGaleri(id) {
    if (confirm("Apakah Anda yakin ingin menghapus foto galeri ini?")) {
        try {
            await remove(ref(db, `galeri/${id}`));
            showAlert("Galeri berhasil dihapus.");
            loadAllData();
        } catch (err) {
            showAlert("Gagal menghapus galeri: " + err.message, "error");
        }
    }
}

const formGaleri = document.getElementById('form-galeri');
if (formGaleri) {
    formGaleri.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formGaleri.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const id = document.getElementById('galeri-id').value;
        const judul = document.getElementById('galeri-judul').value.trim();
        const tanggal = document.getElementById('galeri-tanggal').value;
        const deskripsi = document.getElementById('galeri-deskripsi').value.trim();
        const fileInput = document.getElementById('galeri-foto');
        
        if (!id && fileInput.files.length === 0) {
            showAlert("Harap unggah foto dokumentasi!", "error");
            submitBtn.disabled = false;
            return;
        }
        
        try {
            let fotoUrl = null;
            if (id) {
                const snap = await get(ref(db, `galeri/${id}/foto`));
                if (snap.exists()) fotoUrl = snap.val();
            }
            
            if (fileInput.files.length > 0) {
                fotoUrl = await uploadToStorage(fileInput.files[0], 'galeri');
            }
            
            const payload = { judul, tanggal, deskripsi, foto: fotoUrl };
            
            if (id) {
                await update(ref(db, `galeri/${id}`), payload);
                showAlert("Galeri dokumentasi berhasil diperbarui.");
            } else {
                await push(ref(db, 'galeri'), payload);
                showAlert("Dokumentasi baru berhasil ditambahkan.");
            }
            closeAllForms();
            loadAllData();
        } catch (err) {
            showAlert("Gagal menyimpan galeri: " + err.message, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// -------------------------------------------------------------------------
// BERITA MODULE
// -------------------------------------------------------------------------
const tableBerita = document.getElementById('table-body-berita');
async function loadBeritaList() {
    if (!tableBerita) return;
    try {
        const snapshot = await get(ref(db, 'berita'));
        tableBerita.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            data.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
            
            data.forEach(row => {
                const tr = document.createElement('tr');
                const fotoHtml = row.foto 
                    ? `<img src="${row.foto}" alt="Foto" style="width: 60px; height: 45px; border-radius: var(--radius-sm); object-fit: cover;">`
                    : `<div style="width: 60px; height: 45px; border-radius: var(--radius-sm); background-color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #64748b;">KOSONG</div>`;
                
                tr.innerHTML = `
                    <td>${fotoHtml}</td>
                    <td><strong>${row.judul}</strong></td>
                    <td>${row.penulis}</td>
                    <td>${formatDate(row.tanggal)}</td>
                    <td class="actions-cell" style="justify-content: center;">
                        <button class="action-link action-edit edit-berita-btn" data-id="${row.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                        <button class="action-link action-delete delete-berita-btn" data-id="${row.id}"><i class="bi bi-trash"></i> Hapus</button>
                    </td>
                `;
                tableBerita.appendChild(tr);
            });
            
            document.querySelectorAll('.edit-berita-btn').forEach(btn => {
                btn.addEventListener('click', () => editBerita(btn.getAttribute('data-id')));
            });
            document.querySelectorAll('.delete-berita-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteBerita(btn.getAttribute('data-id')));
            });
        } else {
            tableBerita.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Belum ada berita kegiatan.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function editBerita(id) {
    try {
        const snap = await get(ref(db, `berita/${id}`));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById('berita-id').value = id;
            document.getElementById('berita-judul').value = data.judul;
            document.getElementById('berita-penulis').value = data.penulis;
            document.getElementById('berita-konten').value = data.konten;
            
            document.getElementById('berita-form-title').textContent = 'Edit Artikel Berita';
            document.getElementById('berita-submit-text').textContent = 'Simpan Perubahan';
            
            const preview = document.getElementById('berita-foto-preview-container');
            const previewLink = document.getElementById('berita-foto-preview-link');
            if (data.foto && preview && previewLink) {
                previewLink.href = data.foto;
                previewLink.textContent = data.foto;
                preview.style.display = 'block';
            } else if (preview) {
                preview.style.display = 'none';
            }
            
            document.getElementById('berita-list-view').style.display = 'none';
            document.getElementById('berita-form-view').style.display = 'block';
        }
    } catch (err) {
        showAlert("Gagal mengambil data berita: " + err.message, "error");
    }
}

async function deleteBerita(id) {
    if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
        try {
            await remove(ref(db, `berita/${id}`));
            showAlert("Berita berhasil dihapus.");
            loadAllData();
        } catch (err) {
            showAlert("Gagal menghapus berita: " + err.message, "error");
        }
    }
}

const formBerita = document.getElementById('form-berita');
if (formBerita) {
    formBerita.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formBerita.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const id = document.getElementById('berita-id').value;
        const judul = document.getElementById('berita-judul').value.trim();
        const penulis = document.getElementById('berita-penulis').value.trim();
        const konten = document.getElementById('berita-konten').value.trim();
        const fileInput = document.getElementById('berita-foto');
        const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        try {
            let fotoUrl = null;
            let tanggal = new Date().toISOString();
            if (id) {
                const snap = await get(ref(db, `berita/${id}`));
                if (snap.exists()) {
                    fotoUrl = snap.val().foto;
                    tanggal = snap.val().tanggal;
                }
            }
            
            if (fileInput.files.length > 0) {
                fotoUrl = await uploadToStorage(fileInput.files[0], 'berita');
            }
            
            const payload = { judul, slug, penulis, konten, foto: fotoUrl, tanggal };
            
            if (id) {
                await update(ref(db, `berita/${id}`), payload);
                showAlert("Artikel berita berhasil diperbarui.");
            } else {
                await push(ref(db, 'berita'), payload);
                showAlert("Berita kegiatan berhasil diterbitkan.");
            }
            closeAllForms();
            loadAllData();
        } catch (err) {
            showAlert("Gagal menyimpan berita: " + err.message, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// -------------------------------------------------------------------------
// PESAN MODULE
// -------------------------------------------------------------------------
const tablePesan = document.getElementById('table-body-pesan');
async function loadPesanList() {
    if (!tablePesan) return;
    try {
        const snapshot = await get(ref(db, 'pesan'));
        tablePesan.innerHTML = '';
        if (snapshot.exists()) {
            const data = [];
            snapshot.forEach(c => {
                data.push({ id: c.key, ...c.val() });
            });
            data.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
            
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${row.nama}</strong></td>
                    <td><a href="mailto:${row.email}" style="color: var(--primary); text-decoration: underline; font-size: 0.85rem;">${row.email}</a></td>
                    <td><strong>${row.subjek}</strong></td>
                    <td><p style="font-size: 0.85rem; color: #475569; max-width: 320px; white-space: pre-line;">${row.pesan}</p></td>
                    <td style="font-size: 0.8rem;">${formatDate(row.tanggal)}</td>
                    <td style="text-align: center;">
                        <button class="action-link action-delete delete-pesan-btn" data-id="${row.id}"><i class="bi bi-trash"></i> Hapus</button>
                    </td>
                `;
                tablePesan.appendChild(tr);
            });
            
            document.querySelectorAll('.delete-pesan-btn').forEach(btn => {
                btn.addEventListener('click', () => deletePesan(btn.getAttribute('data-id')));
            });
        } else {
            tablePesan.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">Belum ada pesan masuk dari pengunjung.</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

async function deletePesan(id) {
    if (confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
        try {
            await remove(ref(db, `pesan/${id}`));
            showAlert("Pesan masuk berhasil dihapus.");
            loadAllData();
        } catch (err) {
            showAlert("Gagal menghapus pesan: " + err.message, "error");
        }
    }
}

// -------------------------------------------------------------------------
// PENGATURAN MODULE
// -------------------------------------------------------------------------
const formPengaturan = document.getElementById('form-pengaturan');
async function loadSettingsForm() {
    if (!formPengaturan) return;
    try {
        const snap = await get(ref(db, 'pengaturan'));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById('pengaturan-alamat').value = data.alamat_posko || '';
            document.getElementById('pengaturan-map').value = data.map_embed || '';
            document.getElementById('pengaturan-email').value = data.email || '';
            document.getElementById('pengaturan-whatsapp').value = data.whatsapp || '';
            document.getElementById('pengaturan-instagram').value = data.instagram || '';
            document.getElementById('pengaturan-hari').value = data.hari_pengabdian || '40';
        }
    } catch (err) {
        console.error("Gagal memuat pengaturan: ", err);
    }
}

if (formPengaturan) {
    formPengaturan.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formPengaturan.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const alamat_posko = document.getElementById('pengaturan-alamat').value.trim();
        let map_embed = document.getElementById('pengaturan-map').value.trim();
        const email = document.getElementById('pengaturan-email').value.trim();
        const whatsapp = document.getElementById('pengaturan-whatsapp').value.trim();
        const instagram = document.getElementById('pengaturan-instagram').value.trim();
        const hari_pengabdian = document.getElementById('pengaturan-hari').value.trim();
        
        // Extract map src link if they pasted complete iframe string
        const match = map_embed.match(/src="([^"]+)"/);
        if (match) {
            map_embed = match[1];
        }
        
        const payload = {
            alamat_posko,
            map_embed,
            email,
            whatsapp,
            instagram,
            hari_pengabdian
        };
        
        try {
            await set(ref(db, 'pengaturan'), payload);
            showAlert("Pengaturan Posko berhasil disimpan.");
            loadAllData();
        } catch (err) {
            showAlert("Gagal menyimpan pengaturan: " + err.message, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// -------------------------------------------------------------------------
// GANTI SANDI MODULE
// -------------------------------------------------------------------------
const formGantiSandi = document.getElementById('form-ganti-sandi');

// Password Visibility toggles inside Admin
document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = document.getElementById(`eye-icon-${targetId}`);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        }
    });
});

if (formGantiSandi) {
    formGantiSandi.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formGantiSandi.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const sandiLama = document.getElementById('sandi-lama').value;
        const sandiBaru = document.getElementById('sandi-baru').value;
        const sandiKonfirmasi = document.getElementById('sandi-konfirmasi').value;
        
        if (sandiBaru.length < 6) {
            showAlert("Sandi baru minimal berukuran 6 karakter!", "error");
            submitBtn.disabled = false;
            return;
        }
        
        if (sandiBaru !== sandiKonfirmasi) {
            showAlert("Sandi baru dan konfirmasi tidak cocok!", "error");
            submitBtn.disabled = false;
            return;
        }
        
        if (!currentUser) {
            showAlert("Anda tidak terotentikasi di Firebase Auth.", "error");
            submitBtn.disabled = false;
            return;
        }
        
        try {
            // Re-authenticate user first to prove password_lama is correct
            const credential = EmailAuthProvider.credential(currentUser.email, sandiLama);
            await reauthenticateWithCredential(currentUser, credential);
            
            // Password verified! Now update password
            await updatePassword(currentUser, sandiBaru);
            showAlert("Kata sandi berhasil diperbarui!");
            formGantiSandi.reset();
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                showAlert("Sandi lama yang Anda masukkan salah.", "error");
            } else {
                showAlert("Gagal mengubah sandi: " + err.message, "error");
            }
        } finally {
            submitBtn.disabled = false;
        }
    });
}
