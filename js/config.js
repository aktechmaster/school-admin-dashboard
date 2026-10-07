// Konfigurasi Utama & State Data
let GAS_URL = localStorage.getItem('SDIT_GAS_URL') || 'https://script.google.com/macros/s/AKfycbyvPJwCpToLpXk0kNoJb67dV5Rm4ajZBLzxpJVJrTsQhQKa4qcYjyfIHZsimseDcdEL/exec';

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
