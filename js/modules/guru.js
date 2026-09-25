// js/modules/guru.js

/**
 * Fungsi utama untuk merender tampilan modul Guru.
 * Menyerahkan seluruh pembuatan UI (Search, Filter, Tabel, Paginasi) 
 * ke renderDynamicTable di table-engine.js
 */
function renderGuruTable() {
    renderDynamicTable('Guru', 'container-guru');
}

/**
 * Inisialisasi Modul Guru (dipanggil saat menu Master Guru diklik)
 */
function initGuruModule() {
    renderGuruTable();
}
