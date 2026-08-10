"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, getDoc, setDoc
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./admin.module.css";

const TABS = [
  { key: "wisata", label: "🏄 Kelola Wisata", collection: "wisata" },
  { key: "umkm", label: "🛍️ Kelola UMKM", collection: "umkm" },
  { key: "gallery", label: "📸 Kelola Galeri", collection: "gallery" },
  { key: "news", label: "📰 Kelola Berita", collection: "news" },
  { key: "anggota", label: "👥 Kelola Anggota", collection: "anggota" },
  { key: "programs", label: "🎯 Kelola Program Unggulan", collection: "programs" },
  { key: "kontak", label: "⚙️ Kontak KKN", collection: "config" },
  { key: "pesan", label: "📥 Pesan Masuk", collection: "pesan" },
];

const FIELD_CONFIGS = {
  wisata: [
    { key: "name", label: "Nama Wisata", type: "text", required: true },
    { key: "description", label: "Deskripsi", type: "textarea", required: true },
    { key: "imageUrl", label: "URL Gambar", type: "url", required: false },
  ],
  umkm: [
    { key: "name", label: "Nama Produk", type: "text", required: true },
    { key: "description", label: "Deskripsi", type: "textarea", required: true },
    { key: "imageUrl", label: "URL Gambar", type: "url", required: false },
  ],
  gallery: [
    { key: "imageUrl", label: "URL Gambar", type: "url", required: true },
    { key: "title", label: "Judul Foto", type: "text", required: true },
    { key: "category", label: "Kategori", type: "text", required: false },
  ],
  news: [
    { key: "thumbnailUrl", label: "URL Thumbnail", type: "url", required: true },
    { key: "title", label: "Judul Berita", type: "text", required: true },
    { key: "description", label: "Deskripsi Singkat", type: "textarea", required: true },
    { key: "category", label: "Kategori Kegiatan", type: "text", required: false },
    { key: "bodyImageUrl", label: "URL Gambar Tengah Isi", type: "url", required: false },
  ],
  anggota: [
    { key: "urutan", label: "Urutan Tampil", type: "number", required: true },
    { key: "nama", label: "Nama Lengkap", type: "text", required: true },
    { key: "foto", label: "Nama File Foto (tanpa ekstensi, cth: rivky)", type: "text", required: false },
    { key: "prodi", label: "Program Studi", type: "text", required: false },
    { key: "divisi", label: "Divisi / Jabatan", type: "text", required: true },
    { key: "instagram", label: "Username Instagram (tanpa @)", type: "text", required: false },
  ],
  programs: [
    { key: "urutan", label: "Urutan Tampil", type: "number", required: true },
    { key: "title", label: "Judul Program", type: "text", required: true },
    { key: "description", label: "Deskripsi", type: "textarea", required: true },
    { key: "icon", label: "Emoji / Ikon", type: "text", required: false },
  ],
};

function getEmptyForm(tab) {
  if (!FIELD_CONFIGS[tab]) return {};
  return FIELD_CONFIGS[tab].reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("wisata");
  const [data, setData] = useState({ wisata: [], umkm: [], gallery: [], news: [], anggota: [], programs: [], config: [], pesan: [] });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "add", item: null });
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, message: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "kkn124bojong";
  const CLOUDINARY_IMAGE_FIELDS = ["imageUrl", "thumbnailUrl", "bodyImageUrl"];

  const uploadToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Konfigurasi Cloudinary belum lengkap. Isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
    const payload = new FormData();
    payload.append("file", file);
    payload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    if (CLOUDINARY_FOLDER) payload.append("folder", CLOUDINARY_FOLDER);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: payload,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || "Gagal mengunggah gambar ke Cloudinary.");
    }

    return result.secure_url;
  };

  const handleImageFileChange = async (event, fieldKey) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus({ loading: true, message: "Mengunggah gambar ke Cloudinary..." });
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, [fieldKey]: url }));
      setUploadStatus({ loading: false, message: "✅ Gambar berhasil diunggah. URL otomatis ditambahkan." });
    } catch (err) {
      setUploadStatus({ loading: false, message: `❌ ${err.message}` });
    }
  };

  // State khusus kontak KKN
  const [kontakData, setKontakData] = useState({
    email: "",
    tiktok: "",
    instagram: ""
  });
  const [savingKontak, setSavingKontak] = useState(false);

  // Save kontak KKN
  const handleSaveKontak = async (e) => {
    e.preventDefault();
    setSavingKontak(true);
    try {
      await setDoc(doc(db, "config", "kontak"), {
        ...kontakData,
        updatedAt: serverTimestamp()
      });
      showToast("✅ Kontak KKN berhasil disimpan!");
    } catch (err) {
      showToast("Gagal menyimpan: " + err.message, "danger");
    } finally {
      setSavingKontak(false);
    }
  };

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoaded(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push("/login");
    }
  }, [authLoaded, user, router]);

  // Fetch data for active tab
  const fetchData = useCallback(async (tab) => {
    if (tab === "kontak") {
      setLoading(true);
      try {
        const docRef = doc(db, "config", "kontak");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setKontakData(docSnap.data());
        }
      } catch (err) {
        // fail silently
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const colName = TABS.find(t => t.key === tab)?.collection || tab;
      let q;
      if (tab === "pesan") {
        q = query(collection(db, colName), orderBy("createdAt", "desc"));
      } else {
        const sortField =
          tab === "anggota" || tab === "programs" ? "urutan" :
          tab === "gallery" || tab === "news" ? "title" :
          "name";
        q = query(collection(db, colName), orderBy(sortField, "asc"));
      }
      const snap = await getDocs(q).catch(() =>
        getDocs(collection(db, colName))
      );
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(prev => ({ ...prev, [tab]: items }));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Open Modal
  const openAdd = () => {
    setFormData(getEmptyForm(activeTab));
    setFormError("");
    setModal({ open: true, mode: "add", item: null });
  };

  const openEdit = (item) => {
    setFormData({ ...item });
    setFormError("");
    setModal({ open: true, mode: "edit", item });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add", item: null });
    setFormError("");
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!user) {
      setFormError("Anda belum login. Silakan masuk kembali sebelum menyimpan data.");
      return;
    }

    const fields = FIELD_CONFIGS[activeTab];
    for (const f of fields) {
      if (f.required && !String(formData[f.key] ?? "").trim()) {
        setFormError(`Field "${f.label}" wajib diisi.`);
        return;
      }
    }

    setSavingForm(true);
    const colName = TABS.find(t => t.key === activeTab)?.collection || activeTab;
    try {
      // Convert urutan to number if applicable
      const payload = { ...formData };
      if (payload.urutan !== undefined) payload.urutan = Number(payload.urutan);

      if (modal.mode === "add") {
        await addDoc(collection(db, colName), { ...payload, createdAt: serverTimestamp() });
        showToast("✅ Data berhasil ditambahkan!");
      } else {
        const docRef = doc(db, colName, modal.item.id);
        const { id, ...rest } = payload;
        await updateDoc(docRef, { ...rest, updatedAt: serverTimestamp() });
        showToast("✅ Data berhasil diperbarui!");
      }
      closeModal();
      fetchData(activeTab);
    } catch (err) {
      setFormError("Gagal menyimpan: " + err.message);
    } finally {
      setSavingForm(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const colName = TABS.find(t => t.key === activeTab)?.collection || activeTab;
    try {
      await deleteDoc(doc(db, colName, id));
      showToast("🗑️ Data berhasil dihapus!", "danger");
      fetchData(activeTab);
    } catch (err) {
      showToast("Gagal menghapus: " + err.message, "danger");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const currentData = data[activeTab] || [];

  return (
    <div className={styles.adminPage}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "danger" ? styles.toastDanger : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>🌿</div>
          <div>
            <span className={styles.logoMain}>KKN 124</span>
            <span className={styles.logoSub}>Admin Panel</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.sidebarBtn} ${activeTab === tab.key ? styles.sidebarActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>👤</div>
            <div>
              <div className={styles.adminEmail}>{user?.email || "Admin"}</div>
              <div className={styles.adminRole}>Administrator</div>
            </div>
          </div>
          <a href="/" className={styles.viewSiteBtn} target="_blank" rel="noopener noreferrer">
            🌐 Lihat Website
          </a>
          <button className={styles.logoutBtn} onClick={handleLogout} id="btn-logout">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Bar */}
        <header className={styles.mainHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              {TABS.find(t => t.key === activeTab)?.label}
            </h1>
            <p className={styles.pageDesc}>
              {activeTab === "kontak" ? "Kelola akun sosial media KKN" :
               activeTab === "pesan" ? `${(data.pesan || []).length} pesan masuk dari pengunjung` :
               `${currentData.length} data tersimpan di database`}
            </p>
          </div>
          {activeTab !== "kontak" && activeTab !== "pesan" && (
            <button className={styles.addBtn} onClick={openAdd} id={`btn-add-${activeTab}`}>
              + Tambah Data
            </button>
          )}
        </header>

        {/* Special: Kontak KKN Form */}
        {activeTab === "kontak" ? (
          <div className={styles.kontakPanel}>
            <form onSubmit={handleSaveKontak} className={styles.kontakForm}>
              <div className={styles.kontakField}>
                <label className={styles.kontakLabel}>✉️ Email KKN</label>
                <input
                  type="email"
                  className={styles.kontakInput}
                  placeholder="Masukkan email KKN..."
                  value={kontakData.email || ""}
                  onChange={(e) => setKontakData(prev => ({ ...prev, email: e.target.value }))}
                  id="kontak-email"
                />
              </div>
              <div className={styles.kontakField}>
                <label className={styles.kontakLabel}>📸 Username Instagram (tanpa @)</label>
                <input
                  type="text"
                  className={styles.kontakInput}
                  placeholder="cth: kkn124bojong"
                  value={kontakData.instagram || ""}
                  onChange={(e) => setKontakData(prev => ({ ...prev, instagram: e.target.value }))}
                  id="kontak-instagram"
                />
              </div>
              <div className={styles.kontakField}>
                <label className={styles.kontakLabel}>🎵 Username TikTok (tanpa @)</label>
                <input
                  type="text"
                  className={styles.kontakInput}
                  placeholder="cth: kkn124bojong"
                  value={kontakData.tiktok || ""}
                  onChange={(e) => setKontakData(prev => ({ ...prev, tiktok: e.target.value }))}
                  id="kontak-tiktok"
                />
              </div>
              <div className={styles.kontakPreview}>
                <p className={styles.kontakPreviewTitle}>👁️ Preview Link:</p>
                {kontakData.email && <p>✉️ <a href={`mailto:${kontakData.email}`} style={{color:"#4ecca3"}}>{kontakData.email}</a></p>}
                {kontakData.instagram && <p>📸 <a href={`https://instagram.com/${kontakData.instagram}`} target="_blank" rel="noopener noreferrer" style={{color:"#4ecca3"}}>instagram.com/{kontakData.instagram}</a></p>}
                {kontakData.tiktok && <p>🎵 <a href={`https://tiktok.com/@${kontakData.tiktok}`} target="_blank" rel="noopener noreferrer" style={{color:"#4ecca3"}}>tiktok.com/@{kontakData.tiktok}</a></p>}
              </div>
              <button type="submit" className={styles.saveBtn} disabled={savingKontak} id="btn-save-kontak">
                {savingKontak ? <><span className={styles.spinner} /> Menyimpan...</> : "💾 Simpan Kontak KKN"}
              </button>
            </form>
          </div>
        ) : activeTab === "pesan" ? (
          /* Special: Pesan Masuk Inbox */
          loading ? (
            <div className={styles.loadingTable}>
              <div className={styles.loadingSpinner} />
              <p>Memuat pesan...</p>
            </div>
          ) : (data.pesan || []).length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>Belum ada pesan masuk</h3>
              <p>Pesan dari pengunjung akan muncul di sini.</p>
            </div>
          ) : (
            <div className={styles.pesanList}>
              {(data.pesan || []).map((pesan) => (
                <div key={pesan.id} className={styles.pesanCard}>
                  <div className={styles.pesanHeader}>
                    <div className={styles.pesanAvatar}>{(pesan.nama || "?")[0].toUpperCase()}</div>
                    <div className={styles.pesanMeta}>
                      <strong className={styles.pesanNama}>{pesan.nama || "—"}</strong>
                      <span className={styles.pesanEmail}>{pesan.email || "—"}</span>
                    </div>
                    <div className={styles.pesanActions}>
                      {pesan.email && (
                        <a href={`mailto:${pesan.email}`} className={styles.replyBtn}>✉️ Balas</a>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteConfirm(pesan.id)}
                        id={`btn-delete-pesan-${pesan.id}`}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                  <div className={styles.pesanSubjek}>{pesan.subjek || "(Tanpa Subjek)"}</div>
                  <p className={styles.pesanIsi}>{pesan.pesan || "—"}</p>
                  {pesan.createdAt && (
                    <span className={styles.pesanWaktu}>
                      {pesan.createdAt?.toDate?.()?.toLocaleString("id-ID") || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Default: Table for wisata/umkm/gallery/anggota */
          loading ? (
            <div className={styles.loadingTable}>
              <div className={styles.loadingSpinner} />
              <p>Memuat data...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>Belum ada data</h3>
              <p>Klik tombol "Tambah Data" untuk menambahkan data baru.</p>
              <button className={styles.addBtnEmpty} onClick={openAdd}>+ Tambah Data Pertama</button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>No</th>
                    {activeTab === "anggota" ? (
                      <>
                        <th>No. Urut</th>
                        <th>Foto</th>
                        <th>Nama Lengkap</th>
                        <th>Divisi</th>
                      </>
                    ) : (
                      FIELD_CONFIGS[activeTab]?.slice(0, 3).map(f => (
                        <th key={f.key}>{f.label}</th>
                      ))
                    )}
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, i) => (
                    <tr key={item.id}>
                      <td className={styles.tdNo}>{i + 1}</td>
                      {activeTab === "anggota" ? (
                        <>
                          <td className={styles.tdContent} style={{width:"50px"}}><strong>{item.urutan ?? "-"}</strong></td>
                          <td className={styles.tdContent} style={{width:"60px"}}>
                            {item.foto ? (
                              <img
                                src={`/image/anggota/${item.foto}.jpg`}
                                alt={item.nama}
                                style={{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(26,127,90,0.4)"}}
                                onError={(e)=>{e.target.style.display="none";}}
                              />
                            ) : <span style={{color:"rgba(255,255,255,0.3)"}}>—</span>}
                          </td>
                          <td className={styles.tdContent}><strong>{item.nama || "-"}</strong></td>
                          <td className={styles.tdContent}>
                            <span className={styles.divisiTag}>{item.divisi || "-"}</span>
                          </td>
                        </>
                      ) : (
                        FIELD_CONFIGS[activeTab]?.slice(0, 3).map(f => (
                          <td key={f.key} className={styles.tdContent}>
                            {f.type === "textarea"
                              ? (item[f.key] || "-").substring(0, 60) + ((item[f.key] || "").length > 60 ? "..." : "")
                              : item[f.key] || "-"}
                          </td>
                        ))
                      )}
                      <td className={styles.tdActions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openEdit(item)}
                          id={`btn-edit-${item.id}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setDeleteConfirm(item.id)}
                          id={`btn-delete-${item.id}`}
                        >
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>

      {/* Form Modal */}
      {modal.open && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modal.mode === "add" ? "➕ Tambah Data Baru" : "✏️ Edit Data"}</h2>
              <button className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
              {formError && (
                <div className={styles.formError}>{formError}</div>
              )}

              {FIELD_CONFIGS[activeTab].map((field) => (
                <div key={field.key} className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {field.label}
                    {field.required && <span className={styles.required}>*</span>}
                  </label>

                  {CLOUDINARY_IMAGE_FIELDS.includes(field.key) && activeTab !== "anggota" && (
                    <div className={styles.uploadGroup}>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.formInput}
                        onChange={(e) => handleImageFileChange(e, field.key)}
                        id={`form-upload-${field.key}`}
                      />
                      <small className={styles.uploadHint}>
                        Unggah gambar langsung ke Cloudinary akun <strong>{CLOUDINARY_CLOUD_NAME || "(belum dikonfigurasi)"}</strong>.
                      </small>
                    </div>
                  )}

                  {field.type === "textarea" ? (
                    <textarea
                      className={styles.formInput}
                      rows={3}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      id={`form-${field.key}`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className={styles.formInput}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      id={`form-${field.key}`}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className={styles.formInput}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      id={`form-${field.key}`}
                    />
                  )}

                  {CLOUDINARY_IMAGE_FIELDS.includes(field.key) && formData[field.key] && (
                    <div className={styles.imagePreview}>
                      <img src={formData[field.key]} alt="Preview Gambar" />
                    </div>
                  )}
                </div>
              ))}

              {uploadStatus.message && (
                <div className={`${styles.formInfo} ${uploadStatus.loading ? styles.formInfoLoading : ""}`}>
                  {uploadStatus.message}
                </div>
              )}

              {/* Foto preview live — only for Anggota tab */}
              {activeTab === "anggota" && formData.foto && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>👁️ Preview Foto</label>
                  <div className={styles.fotoPreviewBox}>
                    <img
                      src={`/image/anggota/${formData.foto.trim()}.jpg`}
                      alt="Preview"
                      className={styles.fotoPreviewImg}
                      onError={(e) => { e.target.src = ""; e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    <div className={styles.fotoPreviewFallback} style={{display:"none"}}>
                      <span>❌ File tidak ditemukan</span>
                      <small>/image/anggota/{formData.foto.trim()}.jpg</small>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className={styles.saveBtn} disabled={savingForm} id="btn-save-form">
                  {savingForm ? (
                    <><span className={styles.spinner} /> Menyimpan...</>
                  ) : (
                    <>{modal.mode === "add" ? "➕ Tambahkan" : "💾 Simpan Perubahan"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h3>Konfirmasi Hapus</h3>
            <p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Batal
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={() => handleDelete(deleteConfirm)}
                id="btn-confirm-delete"
              >
                🗑️ Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
