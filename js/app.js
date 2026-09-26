// Logik Utama Aplikasi & Router Navigasi
// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('crudModal');
    
    // Pengecekan aman: hanya inisialisasi jika library bootstrap tersedia
    if (modalEl && typeof bootstrap !== 'undefined') {
        crudModalInstance = new bootstrap.Modal(modalEl);
    } else {
        console.warn('Bootstrap JS belum siap atau gagal dimuat dari CDN.');
    }

    const gasInput = document.getElementById('gas-url-input');
    const displayUrl = document.getElementById('display-api-url');
    
    if (gasInput) gasInput.value = GAS_URL;
    if (displayUrl) displayUrl.innerText = GAS_URL;

    loadAllMasterData();
});

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function saveGasUrl() {
    const url = document.getElementById('gas-url-input').value.trim();
    if (!url) return Swal.fire('Ralat', 'URL tidak boleh kosong', 'error');
    
    localStorage.setItem('SDIT_GAS_URL', url);
    GAS_URL = url;
    document.getElementById('display-api-url').innerText = url;
    Swal.fire('Berjaya', 'URL Web App GAS berjaya dikemas kini!', 'success');
    loadAllMasterData();
}

function showSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('d-none'));
    document.getElementById('sec-' + sectionId).classList.remove('d-none');
    
    document.querySelectorAll('#sidebar .nav-link').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');

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
}

async function loadAllMasterData() {
    if (!GAS_URL) return;
    
    Swal.fire({ 
        title: 'Memuatkan Data...', 
        text: 'Mengambil data daripada Google Sheets', 
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
            throw new Error(result.message || 'Gagal memuatkan data');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Gagal Memuatkan Data', error.message || 'Sila semak semula sambungan atau URL Web App GAS anda.', 'error');
    }
}

function renderAllModules() {
    // Hapus elemen kontrol lama agar diregenerasi dengan opsi filter terbaru saat data master direload
    document.querySelectorAll('[id^="controls-"]').forEach(el => el.remove());

    if (typeof updateDashboardKPI === 'function') updateDashboardKPI();
    if (typeof renderUsersTable === 'function') renderUsersTable();
    if (typeof renderGuruTable === 'function') renderGuruTable();
    if (typeof renderSiswaTable === 'function') renderSiswaTable();
    if (typeof renderKelasTable === 'function') renderKelasTable();
    if (typeof renderMapelTable === 'function') renderMapelTable();
    if (typeof renderJadwalTable === 'function') renderJadwalTable();
}
