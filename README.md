# Sistem Informasi Administrasi Sekolah

![Status](https://img.shields.io/badge/status-aktif-success)
![Frontend](https://img.shields.io/badge/frontend-Vanilla_JS-yellow)
![Framework](https://img.shields.io/badge/css-Bootstrap_5-purple)
![Backend](https://img.shields.io/badge/backend-Google_Apps_Script-blue)

**SDIT Admin** adalah aplikasi administrasi sekolah berbasis **Single Page Application (SPA)** yang ringan, responsif, dan mudah digunakan. Aplikasi menyediakan pengelolaan data master sekolah, jadwal pembelajaran, data halaqoh T2Q dan BPI, hari efektif, serta laporan jurnal dalam satu antarmuka terpadu.

Aplikasi menggunakan **Google Apps Script** sebagai API dan **Google Sheets** sebagai penyimpanan data, sementara antarmuka di-host melalui **GitHub Pages**.

## 🌐 Demo

- Repository: [aktechmaster/school-admin-dashboard](https://github.com/aktechmaster/school-admin-dashboard)
- GitHub Pages: `https://aktechmaster.github.io/school-admin-dashboard/`

## ✨ Fitur Utama

### Dashboard

- Ringkasan jumlah siswa, guru, kelas, dan mata pelajaran.
- Persentase jurnal harian umum dan T2Q.
- Persentase kehadiran guru dan karyawan.
- Tampilan detail jurnal harian dan kehadiran harian.
- Penyegaran data tanpa memuat ulang halaman.

### Data Master

- **Pengguna:** username, identitas guru, role, status, dan penugasan tambahan.
- **Guru & Karyawan:** NIP/NIK, biodata, jabatan, kontaks, beban mengajar, dan status.
- **Siswa:** identitas, riwayat kelas, data orang tua, alamat, dan status.
- **Kelas:** nama kelas, tingkat, dan wali kelas.
- **Mata Pelajaran:** kode, nama, dan kategori mata pelajaran.
- **Jadwal:** hari, jam ke, kelas, guru, mata pelajaran, tahun ajaran, dan semester.
- **Hari Efektif:** penetapan hari KBM atau hari libur berdasarkan bulan.

### Jadwal dan Halaqoh

- Input jadwal satu slot melalui formulir CRUD.
- Input jadwal massal dalam bentuk matriks kelas.
- Pengelompokan siswa T2Q lintas kelas.
- Pengelompokan siswa BPI lintas kelas.
- Pemilihan pengajar atau pembina, tahun ajaran, semester, dan daftar siswa.

### Laporan

- Laporan jurnal umum bulanan dan Juli–Juni.
- Laporan jurnal T2Q bulanan dan Juli–Juni.
- Ekspor laporan ke Microsoft Excel.
- Unduh templat Excel untuk proses impor.
- Ekspor data master melalui engine ekspor aplikasi.

## 🔐 Autentikasi

Aplikasi menggunakan sesi berbasis data pengguna yang dikelola melalui Google Apps Script. Informasi login disimpan pada sisi browser dan halaman dapat mengarahkan pengguna ke halaman login apabila sesi tidak tersedia.

> Keamanan backend, pembatasan akses, dan perlindungan endpoint GAS harus dikonfigurasi sesuai kebutuhan administrasi sekolah.

## 🛠️ Teknologi

| Komponen | Teknologi |
|---|---|
| Struktur | HTML5 |
| Tampilan | Bootstrap 5.3 |
| Ikon | Font Awesome 6 |
| Aplikasi | Vanilla JavaScript ES6 |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Excel | SheetJS / XLSX |
| PDF | jsPDF dan jsPDF-AutoTable |
| Notifikasi | SweetAlert2 |
| Hosting | GitHub Pages |

## 📁 Struktur Proyek

```text
school-admin-dashboard/
├── README.md
├── index.html                    # Tampilan dashboard dan komponen SPA
├── login.html                    # Halaman login
├── background.jpeg               # Gambar latar
├── logosit.png                   # Logo aplikasi
├── CSS/
│   └── style.css                 # Gaya khusus dan responsivitas
└── js/
    ├── app.js                    # Kontrol navigasi dan alur aplikasi
    ├── auth.js                   # Autentikasi dan manajemen sesi
    ├── config.js                 # Konfigurasi URL GAS dan data lokal
    ├── table-engine.js           # CRUD, tabel, pencarian, dan pagination
    ├── export-engine.js          # Ekspor data dan laporan
    ├── import-engine.js          # Impor Excel dan unduh templat
    ├── script.js                 # Utilitas tambahan
    └── modules/
        ├── beranda.js
        ├── users.js
        ├── guru.js
        ├── siswa.js
        ├── kelas.js
        ├── mapel.js
        ├── jadwal.js
        ├── t2q.js
        ├── bpi.js
        ├── hari_efektif.js
        └── laporan.js
```

## ⚙️ Cara Menjalankan

### 1. Jalankan melalui GitHub Pages

Buka alamat:

```text
https://aktechmaster.github.io/school-admin-dashboard/
```

### 2. Jalankan secara lokal

```bash
git clone https://github.com/aktechmaster/school-admin-dashboard.git
cd school-admin-dashboard
```

Jalankan dengan server statis agar pemuatan modul dan alur aplikasi berjalan dengan baik:

```bash
python -m http.server 8000
```

Kemudian buka:

```text
http://localhost:8000
```

> Membuka HTML langsung melalui `file://` dapat menyebabkan pembatasan pada browser. Penggunaan server lokal atau GitHub Pages lebih disarankan.

## 🔌 Konfigurasi Google Apps Script

Endpoint utama aplikasi tersimpan di `js/config.js`:

```javascript
let GAS_URL = localStorage.getItem('SDIT_GAS_URL') || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

URL dapat juga diubah melalui menu **Pengaturan API** pada aplikasi.

Pengaturan disimpan pada `localStorage` browser dengan kunci:

- `SDIT_GAS_URL` — endpoint master dan CRUD
- `SDIT_GAS_LAPORAN_URL` — endpoint khusus laporan
- `SDIT_DB_JURNAL_ID` — identitas database jurnal

Untuk menggunakan backend sendiri:

1. Buat Google Sheets sebagai database.
2. Buat proyek Google Apps Script.
3. Buat handler untuk operasi data seperti baca, tambah, ubah, dan hapus.
4. Terapkan Web App dengan akses sesuai kebutuhan.
5. Masukkan URL deployment pada aplikasi melalui menu Pengaturan API.

Pastikan spreadsheet, Apps Script, dan akun operator memiliki izin yang sesuai.

## 📊 Struktur Data Rujukan

Nama tabel atau sheet yang digunakan aplikasi antara lain:

- `Users`
- `Guru`
- `Siswa`
- `Kelas`
- `Mapel`
- `Jadwal`
- `Tim_Pengajar`
- `Halaqoh_T2Q`
- `Halaqoh_BPI`
- `Hari_Efektif`

Struktur kolom detail dapat dilihat dari formulir modul dan hasil unduhan templat Excel.

## 📤 Impor dan Ekspor

Aplikasi mendukung:

- Mengunduh templat data Excel.
- Mengimpor berkas `.xlsx` atau `.xls`.
- Mengekspor tabel atau laporan ke Excel.
- Ekspor laporan PDF pada modul yang mendukungnya.

Gunakan templat resmi agar nama kolom dan format data sesuai dengan struktur backend.

## 🧭 Status Pengembangan

| Modul | Status |
|---|---|
| Dashboard utama | Tersedia |
| CRUD pengguna | Tersedia |
| CRUD guru | Tersedia |
| CRUD siswa | Tersedia |
| CRUD kelas | Tersedia |
| CRUD mata pelajaran | Tersedia |
| CRUD jadwal | Tersedia |
| Jadwal matriks massal | Tersedia |
| Halaqoh T2Q | Tersedia |
| Halaqoh BPI | Tersedia |
| Hari efektif | Tersedia |
| Laporan jurnal umum | Tersedia |
| Laporan jurnal T2Q | Tersedia |
| Impor dan ekspor Excel | Tersedia |
| Modul jurnal lanjutan | Dalam pengembangan |

## 🔒 Catatan Keamanan

- Jangan membagikan URL backend atau ID spreadsheet kepada pihak yang tidak berwenang.
- Jangan menyimpan password dalam bentuk teks terbuka pada Google Sheets.
- Validasi seluruh input pada sisi Google Apps Script.
- Batasi hak akses backend dan spreadsheet.
- Gunakan HTTPS untuk semua endpoint.
- Back up Google Sheets secara berkala.

## 🤝 Kontribusi

Kontribusi dapat dilakukan melalui:

1. Fork repository.
2. Buat branch fitur baru.
3. Ubah atau tambahkan modul secara terpisah.
4. Uji pada server lokal.
5. Kirim Pull Request dengan penjelasan perubahan.

Contoh:

```bash
git checkout -b fitur/nama-fitur
git commit -m "Tambah fitur nama-fitur"
git push origin fitur/nama-fitur
```

## 👤 Pengembang

Dikembangkan oleh **AKTM** melalui akun GitHub [aktechmaster](https://github.com/aktechmaster).

## 📄 Lisensi

Repository belum mencantumkan berkas lisensi. Untuk penggunaan, modifikasi, distribusi, atau integrasi di luar pengembangan internal, sebaiknya hubungi pemilik repository untuk memperoleh izin yang jelas.
