// Logika Utama Aplikasi & Router Navigasi
// js/app.js

// Deklarasi variabel modal global
let crudModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('crudModal');
    
    // Pengecekan aman: inisialisasi Bootstrap Modal
    if (modalEl && typeof bootstrap !== 'undefined') {
        crudModalInstance = new bootstrap.Modal(modalEl);
    } else {
        console.warn('Bootstrap JS belum siap atau gagal dimuat dari CDN.');
    }

    const gasInput = document.getElementById('gas-url-input');
    const displayUrl = document.getElementById('display-api-url');
    
    if (gasInput && typeof GAS_URL !== 'undefined') gasInput.value = GAS_URL;
    if (displayUrl && typeof GAS_URL !== 'undefined') displayUrl.innerText = GAS_URL;

    // Muat seluruh data master pertama kali
    loadAllMasterData();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

function saveGasUrl() {
    const url = document.getElementById('gas-url-input').value.trim();
    if (!url) return Swal.fire('Gagal', 'URL tidak boleh kosong', 'error');
    
    localStorage.setItem('SDIT_GAS_URL', url);
    if (typeof GAS_URL !== 'undefined') GAS_URL = url;
    
    const displayUrl = document.getElementById('display-api-url');
    if (displayUrl) displayUrl.innerText = url;
    
    Swal.fire('Berhasil', 'URL Web App GAS berhasil diperbarui!', 'success');
    loadAllMasterData();
}

function showSection(sectionId, element) {
    // Sembunyikan semua section & hapus status aktif menu
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('#sidebar .nav-link').forEach(el => el.classList.remove('active'));
    
    // Tampilkan section pilihan & aktifkan nav link
    const targetSec = document.getElementById('sec-' + sectionId);
    if (targetSec) targetSec.classList.remove('d-none');
    if (element) element.classList.add('active');

    // Ubah judul halaman pada Navbar Top
    const titles = {
        dashboard: 'Dashboard Overview',
        users: 'Master Users',
        guru: 'Master Guru',
        siswa: 'Master Siswa',
        kelas: 'Master Kelas',
        mapel: 'Master Mapel',
        jadwal: 'Master Jadwal Pelajaran',
        settings: 'Pengaturan Koneksi API'
    };
    document.getElementById('page-title').innerText = titles[sectionId] || 'Dashboard Admin';

    // Memastikan tabel dirender ulang saat section dibuka
    switch (sectionId) {
        case 'users':
            if (typeof renderUsersTable === 'function') renderUsersTable();
            break;
        case 'guru':
            if (typeof renderGuruTable === 'function') renderGuruTable();
            break;
        case 'siswa':
            if (typeof renderSiswaTable === 'function') renderSiswaTable();
            break;
        case 'kelas':
            if (typeof renderKelasTable === 'function') renderKelasTable();
            break;
        case 'mapel':
            if (typeof renderMapelTable === 'function') renderMapelTable();
            break;
        case 'jadwal':
            if (typeof renderJadwalTable === 'function') renderJadwalTable();
            break;
    }
}

async function loadAllMasterData() {
    if (typeof GAS_URL === 'undefined' || !GAS_URL) return;
    
    Swal.fire({ 
        title: 'Memuat Data...', 
        text: 'Mengambil data dari Google Sheets', 
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
    });
    
    try {
        const response = await fetch(`${GAS_URL}?action=readAllMaster`);
        const result = await response.json();
        
        if (result.status === 'success') {
            localData = result.data;
            renderAllModules();
            Swal.close();
        } else {
            throw new Error(result.message || 'Gagal memuat data');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Gagal Memuat Data', error.message || 'Silakan periksa kembali koneksi atau URL Web App GAS Anda.', 'error');
    }
}

function renderAllModules() {
    if (typeof updateDashboardKPI === 'function') updateDashboardKPI();
    if (typeof renderUsersTable === 'function') renderUsersTable();
    if (typeof renderGuruTable === 'function') renderGuruTable();
    if (typeof renderSiswaTable === 'function') renderSiswaTable();
    if (typeof renderKelasTable === 'function') renderKelasTable();
    if (typeof renderMapelTable === 'function') renderMapelTable();
    if (typeof renderJadwalTable === 'function') renderJadwalTable();
}
