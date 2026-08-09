"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./admin.module.css";

const TABS = [
  { key: "wisata", label: "🏄 Kelola Wisata", collection: "wisata" },
  { key: "umkm", label: "🛍️ Kelola UMKM", collection: "umkm" },
  { key: "gallery", label: "📸 Kelola Galeri", collection: "gallery" },
  { key: "anggota", label: "👥 Kelola Anggota", collection: "anggota" },
];

const FIELD_CONFIGS = {
  wisata: [
    { key: "name", label: "Nama Wisata", type: "text", required: true },
    { key: "description", label: "Deskripsi", type: "textarea", required: true },
    { key: "price", label: "Harga Tiket", type: "text", required: false },
    { key: "location", label: "Lokasi", type: "text", required: false },
    { key: "openHour", label: "Jam Operasional", type: "text", required: false },
    { key: "imageUrl", label: "URL Gambar", type: "url", required: false },
  ],
  umkm: [
    { key: "name", label: "Nama Produk", type: "text", required: true },
    { key: "category", label: "Kategori", type: "select", options: ["Kerajinan", "Seni", "Makanan", "Lainnya"], required: true },
    { key: "owner", label: "Nama Pemilik", type: "text", required: false },
    { key: "contact", label: "No. WhatsApp", type: "text", required: false },
    { key: "description", label: "Deskripsi", type: "textarea", required: true },
    { key: "price", label: "Harga", type: "text", required: false },
    { key: "imageUrl", label: "URL Gambar", type: "url", required: false },
  ],
  gallery: [
    { key: "title", label: "Judul Foto", type: "text", required: true },
    { key: "description", label: "Deskripsi", type: "textarea", required: true },
    { key: "imageUrl", label: "URL Gambar", type: "url", required: false },
  ],
  anggota: [
    { key: "nama", label: "Nama Lengkap", type: "text", required: true },
    { key: "nim", label: "NIM", type: "text", required: false },
    { key: "prodi", label: "Program Studi", type: "text", required: false },
    {
      key: "divisi",
      label: "Divisi / Jabatan",
      type: "select",
      options: [
        "Ketua",
        "Wakil Ketua",
        "Sekretaris",
        "Bendahara",
        "Humas",
        "Pendidikan",
        "Kesehatan",
        "Lingkungan",
        "Ekonomi",
        "Acara",
        "Dokumentasi",
        "Anggota",
      ],
      required: true,
    },
    { key: "instagram", label: "Username Instagram (tanpa @)", type: "text", required: false },
  ],
};

function getEmptyForm(tab) {
  return FIELD_CONFIGS[tab].reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("wisata");
  const [data, setData] = useState({ wisata: [], umkm: [], gallery: [], anggota: [] });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "add", item: null });
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch data for active tab
  const fetchData = useCallback(async (tab) => {
    setLoading(true);
    try {
      const colName = TABS.find(t => t.key === tab)?.collection || tab;
      // Use appropriate sort field per collection
      const sortField =
        tab === "anggota" ? "nama" :
        tab === "gallery" ? "title" :
        "name";
      const q = query(collection(db, colName), orderBy(sortField, "asc"));
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
    const fields = FIELD_CONFIGS[activeTab];
    for (const f of fields) {
      if (f.required && !formData[f.key]?.trim()) {
        setFormError(`Field "${f.label}" wajib diisi.`);
        return;
      }
    }

    setSavingForm(true);
    const colName = TABS.find(t => t.key === activeTab)?.collection || activeTab;
    try {
      if (modal.mode === "add") {
        await addDoc(collection(db, colName), { ...formData, createdAt: serverTimestamp() });
        showToast("✅ Data berhasil ditambahkan!");
      } else {
        const ref = doc(db, colName, modal.item.id);
        const { id, ...rest } = formData;
        await updateDoc(ref, { ...rest, updatedAt: serverTimestamp() });
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
              {currentData.length} data tersimpan di database
            </p>
          </div>
          <button className={styles.addBtn} onClick={openAdd} id={`btn-add-${activeTab}`}>
            + Tambah Data
          </button>
        </header>

        {/* Table */}
        {loading ? (
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
                      <th>Nama Lengkap</th>
                      <th>Prodi</th>
                      <th>Divisi</th>
                      <th>Instagram</th>
                    </>
                  ) : (
                    FIELD_CONFIGS[activeTab].slice(0, 3).map(f => (
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
                        <td className={styles.tdContent}><strong>{item.nama || "-"}</strong></td>
                        <td className={styles.tdContent}>{item.prodi || "-"}</td>
                        <td className={styles.tdContent}>
                          <span className={styles.divisiTag}>{item.divisi || "-"}</span>
                        </td>
                        <td className={styles.tdContent}>
                          {item.instagram ? (
                            <a
                              href={`https://instagram.com/${item.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.igLink}
                            >
                              @{item.instagram.replace("@", "")}
                            </a>
                          ) : (
                            <span className={styles.noIg}>—</span>
                          )}
                        </td>
                      </>
                    ) : (
                      FIELD_CONFIGS[activeTab].slice(0, 3).map(f => (
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
                </div>
              ))}

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
