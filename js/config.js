// Konfigurasi Utama & State Data
let GAS_URL = localStorage.getItem('SDIT_GAS_URL') || 'https://script.google.com/macros/s/AKfycbyOZZYLHzfbE4Y_irbsPMquvqrLi0cIBM0IB-UJpOSIkjv7YVEmILR-xNIUa2Ufm-G9/exec';

let localData = {
    Users: [],
    Guru: [],
    Siswa: [],
    Kelas: [],
    Mapel: [],
    Jadwal: []
};
// Penampung state pencarian, filter, & paginasi per tabel
const tableStates = {};

function getTableState(tableName) {
    if (!tableStates[tableName]) {
        tableStates[tableName] = {
            search: '',
            filters: {},
            currentPage: 1,
            pageSize: 10
        };
    }
    return tableStates[tableName];
}
