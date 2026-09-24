# Sistem Informasi Administrasi Sekolah

Aplikasi manajemen administrasi sekolah berbasis **Single Page Application (SPA)** yang ringan, responsif, dan terorganisir. Sistem ini dirancang untuk di-host pada GitHub Pages dan terintegrasi langsung dengan **Google Sheets** menggunakan **Google Apps Script (GAS)** sebagai backend API.

```

---

## 🚀 Fitur Utama

### 1. Modul CRUD Master Data (Dashboard Admin)

* **Database Username:** Pengelolaan akun pengguna, *password*, dan hak akses (*role*).
* **Database Guru & Karyawan:** Pendataan biodata guru, staf, dan wali kelas.
* **Database Kelas:** Manajemen tingkat dan pembagian kelas.
* **Database Siswa:** Pendataan siswa lengkap dengan informasi kontak orang tua.
* **Database Mata Pelajaran:** Pengelompokan mapel akademik dan muatan lokal.
* **Database Jadwal:** Pengaturan jadwal mengajar harian guru.
* **Fitur Utilitas:** Ekspor & Impor data via Excel (.xlsx) serta cetak laporan PDF.

### 2. Modul Jurnal & Dashboard Guru *(Rencana Pengembangan Tahap 2)*

* Jurnal Mengajar Harian (Seluruh Guru)
* Presensi / Kehadiran Kelas (Wali Kelas)
* Jurnal Khusus (T2Q, BPI, Sikap & Perilaku Siswa, Ekstra)
* Jurnal Wakur (Absensi Karyawan, Piket, Catatan Kinerja)

### 3. Laporan & Rekapitulasi *(Rencana Pengembangan Tahap 3)*

* Dashboard persentase ketaatan jurnal guru dan tingkat kehadiran siswa.

---

## 🛠️ Stack Teknologi

* **Frontend:** HTML5, Vanilla JS (ES6 Modular Architecture)
* **CSS Framework:** Bootstrap 5
* **Backend & Database:** Google Apps Script (GAS) & Google Sheets
* **Library Integrasi:** SheetJS / XLSX (Excel Integration), jsPDF (PDF Export)
* **Hosting Frontend:** GitHub Pages

---

## 📁 Struktur Berkas

```text
├── README.md           # Dokumentasi Proyek
├── index.html          # Halaman Login Utama
├── dashboard.html      # Layout Utama Dashboard (SPA)
├── css/
│   └── style.css       # Style Kustom & Override Bootstrap
└── js/
    ├── config.js       # Konfigurasi URL API & Parameter Global
    ├── auth.js         # Logika Otentikasi & Manajemen Sesi Login
    ├── app.js          # Main Router SPA & Navigasi Sidebar
    ├── table-engine.js # Engine Generik CRUD, Tabel, Search, & Ekspor
    └── modules/        # Modul JS Spesifik untuk Setiap Tab
        ├── username.js
        ├── guru.js
        ├── kelas.js
        ├── siswa.js
        ├── mapel.js
        └── jadwal.js
