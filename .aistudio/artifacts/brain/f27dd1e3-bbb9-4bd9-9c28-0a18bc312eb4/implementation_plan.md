# Rencana Peningkatan UI/UX Responsif, Keamanan Passkey, dan Integrasi Administrasi Guru & Supervisi Akademik

Rencana pembaruan menyeluruh untuk mengoptimalkan pengalaman pengguna di smartphone & tablet, memperkuat keamanan akses berbasis passkey tanpa kebocoran informasi, memperbaiki fungsionalitas hapus data secara permanen di semua modul, serta mengintegrasikan dua menu utama baru: **Administrasi Guru** dan **Supervisi Akademik** dengan dukungan berkas PDF real-time.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan yang Telah Dikonfirmasi (Berdasarkan Jawaban Klarifikasi):**
> 1. **Navigasi Mobile & Tablet**: Menggunakan **Sidebar Drawer Geser dengan Tombol Menu Hamburger** (animasi halus, backdrop blur, hitbox sentuh $\ge 44\text{px}$, menutup otomatis saat memilih menu).
> 2. **Instrumen Supervisi Akademik**: Penilaian 4 komponen perencanaan (Pendahuluan, Inti, Pengelolaan Kelas, Penutup) menggunakan **Skala Skor 1–4 (1: Kurang, 2: Cukup, 3: Baik, 4: Amat Baik)** disertai predikat otomatis dan catatan kualitatif.
> 3. **Penyimpanan Berkas PDF**: Menggunakan **Penyimpanan Real-Time Firebase** dengan kompresi base64 terenkripsi dan cadangan dokumen browser untuk menjamin keandalan preview dan unduhan instan.

- **Keputusan Keamanan Passkey**: Sesuai instruksi pengguna, semua informasi atau petunjuk (hint) mengenai kode passkey (termasuk default passkey) **dihilangkan sepenuhnya** dari kotak input maupun teks deskripsi modal verifikasi.
- **Validasi Dashboard**: Seluruh tombol pintasan cepat, kartu statistik, dan tautan aksi di Dashboard yang mengarah ke menu terkunci akan mewajibkan verifikasi nama dan passkey terlebih dahulu sebelum membuka halaman tujuan.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**:
  1. **Navigasi Responsif Multi-Device**: Sidebar drawer modern khusus smartphone dan tablet dengan tombol hamburger, transisi mulus, dan kartu data adaptif agar tabel tidak terpotong pada layar sempit.
  2. **Perbaikan Fitur Hapus (CRUD Deletion)**: Memperbaiki logika penghapusan di seluruh modul (Guru, Jadwal, Kurikulum Induk, Perencanaan, Administrasi Guru, Supervisi) agar modal konfirmasi berfungsi 100%, menghapus dokumen di Firestore, dan mengupdate state secara instan.
  3. **Pengetatan Akses Keamanan Passkey**: Menutup celah akses langsung dari Dashboard, memastikan semua menu selain Dashboard terkunci, serta membersihkan teks informasi/bocoran passkey dari modal verifikasi.
  4. **Menu Administrasi Guru**:
     - *SK Pembagian Tugas Guru*: Form isian Nama Guru, Mata Pelajaran, Kelas, Tanggal Terbit SK, Ekuivalensi, Keterangan, berkas PDF, download, edit, dan hapus.
     - *Jadwal Pelajaran*: Menampilkan jadwal pelajaran efektif tiap semester berbasis PDF yang dapat diunggah, dilihat, dan diunduh.
  5. **Menu Supervisi Akademik**:
     - *Program Supervisi Tahunan*: Latar Belakang, Ruang Lingkup, Strategi & Pendekatan, Mekanisme Pelaksanaan, dan Sumber Daya Pembiayaan.
     - *Instrumen Supervisi*: Nama Guru, Mapel, Kelas, Beban JP, Ekuivalensi (opsional), 4 Komponen Perencanaan (Pendahuluan, Inti, Pengelolaan Kelas, Penutup) dengan skala skor 1–4 dan catatan kualitatif.
     - *Jadwal Supervisi*: Hari/Tanggal Pelaksanaan, Jam Pelajaran keberapa, Target Kelas, Nama Guru disupervisi, Mata Pelajaran yang diampu, Nama Supervisor.
     - *Laporan Supervisi*: Pengunggahan berkas laporan PDF, unduh, lihat preview, dan hapus.
     - *Tindak Lanjut*: Umpan Balik (Feedback), Pembinaan (Coaching), Pelatihan/Workshop, Monitoring Lanjutan.
  6. **Pencatatan Log Aktivitas**: Setiap penambahan, pengubahan, pengunduhan, dan penghapusan data di menu baru otomatis tercatat pada Log Aktivitas di Dashboard.

---

## 2. User Experience & Visual Design

### Alur Pengguna (User Flows)
1. **Akses dari Smartphone/Tablet**:
   - Pengguna membuka aplikasi di ponsel; header menampilkan judul ringkas, status koneksi, dan tombol hamburger $\ge 44\text{px}$.
   - Menekan tombol hamburger membuka Sidebar Drawer dari sisi kiri layar dengan latar belakang gelap transparan (*backdrop blur*).
   - Pengguna dapat melihat daftar menu dengan ikon jelas dan status gembok untuk menu yang terkunci.
2. **Pintas Dari Dashboard Terproteksi**:
   - Menekan tombol seperti *"Kelola Jadwal"*, *"Buka Rekap Kehadiran"*, atau *"Kelola Administrasi Guru"* di Dashboard akan memeriksa status verifikasi.
   - Jika belum terverifikasi, muncul modal verifikasi nama dan passkey tanpa menampilkan petunjuk kode passkey. Setelah sukses, langsung dialihkan ke menu yang dituju.
3. **Pengoperasian Hapus yang Andal**:
   - Klik tombol hapus (ikon tong sampah) membuka `ConfirmDeleteModal` dengan nama data spesifik.
   - Klik tombol *"Ya, Hapus"* menjalankan fungsi Firestore `deleteDoc`, menghapus item dari state React, mencatat ke log aktivitas, dan menutup modal seketika.

### Tema & Tipografi
- **Palet Warna**:
  - Dominan Kanvas: Netral slate bersih (`bg-slate-50`, `bg-white`)
  - Aksen Primer: Biru indigo sekolah (`#4338CA` / `indigo-700`)
  - Aksen Sukses & Tindakan: Emerald (`#059669`) dan Amber (`#D97706`)
  - Aksen Bahaya (Hapus): Rose (`#E11D48` / `rose-600`)
- **Tipografi**: `Plus Jakarta Sans` dengan angka tabular (`tabular-nums`) untuk data beban JP, persentase kehadiran, dan skor supervisi.
- **Anti-Slop Discipline**: Tanpa pil warna-warni yang bertumpuk, tanpa komentar kode buatan, dan tanpa angka rekaan.

---

## 3. Key Product Decisions & Trade-Offs

| Keputusan | Pendekatan Terpilih | Alasan & Keuntungan |
| :--- | :--- | :--- |
| **Gaya Navigasi Mobile** | Sidebar Drawer Hamburger Slide-Over | Menyediakan ruang yang luas dan rapi untuk 12 menu lengkap tanpa memotong teks atau menyulitkan navigasi. |
| **Kerahasiaan Passkey** | Input password tanpa petunjuk kode bawaan | Menghindari celah keamanan di mana pengguna yang belum berwenang melihat petunjuk kode passkey. |
| **Penanganan Hapus** | Optimistic + Confirmed Firestore Deletion | Mencegah data kembali muncul (stale) dan memberikan konfirmasi jelas sebelum penghapusan permanen. |
| **Format Instrumen Supervisi** | Skala 1–4 + Predikat + Catatan | Memenuhi standar supervisi akademik formal Kemdikbud/Kemenag dengan evaluasi kuantitatif dan kualitatif. |

---

## 4. Technical Architecture & Data Strategy

### System & Navigation Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│  [Hamburger] [Logo + Nama Sekolah]               [Status] [Verifikasi] │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌────────────────────────┐                        ┌──────────────────────┐
│  Mobile Sidebar Drawer │                        │ Desktop Tab Strip    │
│  - Dashboard (Bebas)   │                        │ (12 Menu Utama)      │
│  - Kurikulum Induk 🔒  │                        └──────────────────────┘
│  - Perencanaan Kurik 🔒│
│  - Administrasi Guru 🔒│
│  - Supervisi Akademik 🔒
│  - Data Guru 🔒        │
│  - Jadwal & JP 🔒      │
│  - Presensi & SP 🔒    │
│  - WhatsApp & Laporan 🔒
│  - Pengaturan 🔒       │
└──────────┬─────────────┘
           │
           ▼ (Jika belum terverifikasi)
┌────────────────────────────────────────────────────────┐
│             AccessVerificationModal                     │
│  - Nama Pengakses (Input Teks)                         │
│  - Kode Passkey (Input Sandi tanpa bocoran info)       │
│  - Aksi: Batal / Verifikasi & Buka                     │
└──────────────────────────┬─────────────────────────────┘
                           │ Sukses
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Main Content Views                             │
│                                                                        │
│ ├─ Dashboard (Metrik, Pintasan Terproteksi, Log Aktivitas Realtime)   │
│ ├─ Dokumen Induk Kurikulum (4 Submenu, PDF, Preview, Download, CRUD)   │
│ ├─ Perencanaan Kurikulum (Prota, Promes, ATP, PDF, Preview, CRUD)      │
│ ├─ Administrasi Guru (SK Pembagian Tugas + Jadwal Pelajaran PDF)      │
│ ├─ Supervisi Akademik (Program, Instrumen 1-4, Jadwal, Laporan, TL)   │
│ └─ Modul Manajemen Guru, Jadwal, Presensi, Surat SP, & WhatsApp       │
└────────────────────────────────────────────────────────────────────────┘
```

### Rencana File & Perubahan Kode
1. **`src/types.ts`**:
   - Memastikan tipe `TeacherAdminDoc`, `TeacherAdminSubmenu`, `SupervisionProgram`, `SupervisionInstrument`, `SupervisionSchedule`, `SupervisionReport`, `SupervisionFollowUp` lengkap dan presisi.
2. **`src/components/Navbar.tsx`**:
   - Menambahkan state `isMobileDrawerOpen`.
   - Menambahkan tombol hamburger di header untuk mobile/tablet.
   - Menambahkan menu `teacher_admin` dan `academic_supervision` tepat di sebelah `curriculum_plan`.
   - Membuat komponen drawer navigasi geser dengan transisi halus dan penutup backdrop.
3. **`src/components/AccessVerificationModal.tsx`**:
   - Menghapus informasi kode passkey (contoh "Default: 123456" atau petunjuk teks apa pun) agar kerahasiaan terjaga.
4. **`src/components/Dashboard.tsx`**:
   - Memperbarui semua fungsi `handleTabChange` dan klik pintasan agar memanggil handler terproteksi dari induk (`App.tsx`), sehingga tidak dapat membypass passkey.
5. **`src/components/TeacherAdminManagement.tsx` & `AcademicSupervisionManagement.tsx`**:
   - Memastikan fungsionalitas hapus data bekerja sempurna dengan `ConfirmDeleteModal`, update state, dan logging aktivitas.
   - Menyesuaikan tata letak responsif tabel dan formulir untuk tampilan mobile dan tablet.
6. **`src/App.tsx`**:
   - Menghubungkan real-time listener Firestore untuk koleksi `teacherAdminDocs` dan `academicSupervision`.
   - Menghubungkan props CRUD lengkap untuk `TeacherAdminManagement` dan `AcademicSupervisionManagement`.
   - Memastikan fungsi `handleTabChange` memvalidasi sesi passkey sebelum membuka menu terkunci dari Dashboard.
7. **Verifikasi Build**:
   - Menjalankan `compile_applet` untuk memastikan seluruh tipe dan kode terkompilasi 100% tanpa error.
