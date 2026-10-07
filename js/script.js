// script.js

// CONFIG & STATE (Hardcoded Web App URL)
let GAS_URL = 'https://script.google.com/macros/s/AKfycbwkapFCSh949dImZF-gw959mmFvQ05GL7Fkf-RRXsbZMp0AvAG2KYuadbeBjqFH55M_/exec';
let localData = { Users: [], Guru: [], Siswa: [], Kelas: [], Mapel: [], Jadwal: [] };
let crudModalInstance;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('crudModal');
    if (modalEl) {
        crudModalInstance = new bootstrap.Modal(modalEl);
    }

    // Tampilkan URL terpasang di menu Pengaturan
    const gasInput = document.getElementById('gas-url-input');
    const displayUrl = document.getElementById('display-api-url');
    
    if (gasInput) gasInput.value = GAS_URL;
    if (displayUrl) displayUrl.innerText = GAS_URL;

    // Muat seluruh data master dari GAS saat pertama kali dibuka
    loadAllMasterData();
});

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function saveGasUrl() {
    const url = document.getElementById('gas-url-input').value.trim();
    if (!url) return Swal.fire('Error', 'URL tidak boleh kosong', 'error');
    
    localStorage.setItem('SDIT_GAS_URL', url);
    GAS_URL = url;
    document.getElementById('display-api-url').innerText = url;
    Swal.fire('Berhasil', 'URL Web App GAS berhasil diperbarui!', 'success');
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

// ================= FETCH & RENDER API DATA =================
async function loadAllMasterData() {
    if (!GAS_URL) return;
    
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
            updateDashboardKPI();
            renderAllTables();
            Swal.close();
        } else {
            throw new Error(result.message || 'Gagal memuat data');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Gagal Memuat Data', error.message || 'Periksa kembali koneksi atau URL Web App GAS Anda.', 'error');
    }
}

function updateDashboardKPI() {
    document.getElementById('kpi-siswa').innerText = (localData.Siswa || []).length;
    document.getElementById('kpi-guru').innerText = (localData.Guru || []).length;
    document.getElementById('kpi-kelas').innerText = (localData.Kelas || []).length;
    document.getElementById('kpi-mapel').innerText = (localData.Mapel || []).length;
}

function renderAllTables() {
    renderUsersTable();
    renderGuruTable();
    renderSiswaTable();
    renderKelasTable();
    renderMapelTable();
    renderJadwalTable();
}

function renderUsersTable() {
    const tbody = document.querySelector('#table-users tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Users || []).map(row => `
        <tr>
            <td><b>${row.id_user || ''}</b></td>
            <td>${row.username || ''}</td>
            <td>${row.id_guru || '-'}</td>
            <td><span class="badge bg-info">${row.role || ''}</span></td>
            <td>${row.status_aktif ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-danger">Nonaktif</span>'}</td>
            <td>${row.is_wali_kelas ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_wakur ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_t2q ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_bpi ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_ekstra ? 'Ya' : 'Tidak'}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Users', '${row.id_user}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Users', '${row.id_user}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderGuruTable() {
    const tbody = document.querySelector('#table-guru tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Guru || []).map(row => `
        <tr>
            <td><b>${row.id_guru || ''}</b></td>
            <td>${row.nip_nik || '-'}</td>
            <td>${row.nama_lengkap || ''}</td>
            <td>${row.jenis_kelamin || ''}</td>
            <td>${row.no_hp || ''}</td>
            <td>${row.email || ''}</td>
            <td>${row.jabatan || ''}</td>
            <td><span class="badge bg-secondary">${row.status_karyawan || ''}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Guru', '${row.id_guru}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Guru', '${row.id_guru}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderSiswaTable() {
    const tbody = document.querySelector('#table-siswa tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Siswa || []).map(row => `
        <tr>
            <td><b>${row.id_siswa || ''}</b></td>
            <td>${row.nisn || '-'}</td>
            <td>${row.nis || '-'}</td>
            <td>${row.nama_siswa || ''}</td>
            <td>${row.jenis_kelamin || ''}</td>
            <td>${row.id_kelas || ''}</td>
            <td>${row.nama_ayah || ''}</td>
            <td>${row.nama_ibu || ''}</td>
            <td>${row.no_hp_ortu || ''}</td>
            <td><span class="badge bg-primary">${row.status_siswa || 'Aktif'}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Siswa', '${row.id_siswa}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Siswa', '${row.id_siswa}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderKelasTable() {
    const tbody = document.querySelector('#table-kelas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Kelas || []).map(row => `
        <tr>
            <td><b>${row.id_kelas || ''}</b></td>
            <td>${row.nama_kelas || ''}</td>
            <td>Tingkat ${row.tingkat || ''}</td>
            <td>${row.id_wali_kelas || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Kelas', '${row.id_kelas}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Kelas', '${row.id_kelas}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderMapelTable() {
    const tbody = document.querySelector('#table-mapel tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Mapel || []).map(row => `
        <tr>
            <td><b>${row.id_mapel || ''}</b></td>
            <td>${row.kode_mapel || ''}</td>
            <td>${row.nama_mapel || ''}</td>
            <td><span class="badge bg-info text-dark">${row.kategori || 'Umum'}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Mapel', '${row.id_mapel}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Mapel', '${row.id_mapel}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderJadwalTable() {
    const tbody = document.querySelector('#table-jadwal tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Jadwal || []).map(row => `
        <tr>
            <td><b>${row.id_jadwal || ''}</b></td>
            <td>${row.hari || ''}</td>
            <td>Jam Ke-${row.jam_ke || ''}</td>
            <td>${row.id_kelas || ''}</td>
            <td>${row.id_mapel || ''}</td>
            <td>${row.id_guru || ''}</td>
            <td>${row.tahun_ajaran || ''}</td>
            <td>Semester ${row.semester || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Jadwal', '${row.id_jadwal}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Jadwal', '${row.id_jadwal}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ================= DYNAMIC FORM GENERATOR =================
const TABLE_SCHEMAS = {
    Users: [
        { name: 'id_user', label: 'ID User', type: 'text', primaryKey: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password_hash', label: 'Password / Hash', type: 'password' },
        { name: 'id_guru', label: 'ID Guru', type: 'text' },
        { name: 'role', label: 'Role', type: 'select', options: ['Admin', 'Kepsek', 'Guru', 'WaliKelas'] },
        { name: 'status_aktif', label: 'Status Aktif', type: 'boolean' },
        { name: 'is_wali_kelas', label: 'Is Wali Kelas', type: 'boolean' },
        { name: 'is_wakur', label: 'Is Wakur', type: 'boolean' },
        { name: 'is_t2q', label: 'Is T2Q', type: 'boolean' },
        { name: 'is_bpi', label: 'Is BPI', type: 'boolean' },
        { name: 'is_ekstra', label: 'Is Ekstra', type: 'boolean' }
    ],
    Guru: [
        { name: 'id_guru', label: 'ID Guru', type: 'text', primaryKey: true },
        { name: 'nip_nik', label: 'NIP / NIK', type: 'text' },
        { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', required: true },
        { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'] },
        { name: 'no_hp', label: 'No. HP / WhatsApp', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'jabatan', label: 'Jabatan', type: 'text' },
        { name: 'status_karyawan', label: 'Status Karyawan', type: 'select', options: ['Tetap', 'Kontrak', 'Honorer'] }
    ],
    Siswa: [
        { name: 'id_siswa', label: 'ID Siswa', type: 'text', primaryKey: true },
        { name: 'nisn', label: 'NISN', type: 'text' },
        { name: 'nis', label: 'NIS', type: 'text' },
        { name: 'nama_siswa', label: 'Nama Siswa', type: 'text', required: true },
        { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'] },
        { name: 'id_kelas', label: 'ID Kelas', type: 'text' },
        { name: 'nama_ayah', label: 'Nama Ayah', type: 'text' },
        { name: 'pekerjaan_ayah', label: 'Pekerjaan Ayah', type: 'text' },
        { name: 'nama_ibu', label: 'Nama Ibu', type: 'text' },
        { name: 'pekerjaan_ibu', label: 'Pekerjaan Ibu', type: 'text' },
        { name: 'no_hp_ortu', label: 'No HP Orang Tua', type: 'text' },
        { name: 'status_siswa', label: 'Status Siswa', type: 'select', options: ['Aktif', 'Lulus', 'Pindah', 'Keluar'] }
    ],
    Kelas: [
        { name: 'id_kelas', label: 'ID Kelas', type: 'text', primaryKey: true },
        { name: 'nama_kelas', label: 'Nama Kelas', type: 'text', required: true },
        { name: 'tingkat', label: 'Tingkat (1-6)', type: 'number' },
        { name: 'id_wali_kelas', label: 'ID Wali Kelas', type: 'text' }
    ],
    Mapel: [
        { name: 'id_mapel', label: 'ID Mapel', type: 'text', primaryKey: true },
        { name: 'kode_mapel', label: 'Kode Mapel', type: 'text' },
        { name: 'nama_mapel', label: 'Nama Mata Pelajaran', type: 'text', required: true },
        { name: 'kategori', label: 'Kategori', type: 'select', options: ['Umum', 'Diniyah', 'Muatan Lokal', 'Ekstrakurikuler'] }
    ],
    Jadwal: [
        { name: 'id_jadwal', label: 'ID Jadwal', type: 'text', primaryKey: true },
        { name: 'hari', label: 'Hari', type: 'select', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] },
        { name: 'jam_ke', label: 'Jam Ke', type: 'number' },
        { name: 'id_kelas', label: 'ID Kelas', type: 'text' },
        { name: 'id_mapel', label: 'ID Mapel', type: 'text' },
        { name: 'id_guru', label: 'ID Guru', type: 'text' },
        { name: 'tahun_ajaran', label: 'Tahun Ajaran', type: 'text', placeholder: '2026/2027' },
        { name: 'semester', label: 'Semester', type: 'select', options: ['Ganjil', 'Genap'] }
    ]
};

function openModal(table, data = null) {
    document.getElementById('formTable').value = table;
    document.getElementById('formAction').value = data ? 'update' : 'create';
    document.getElementById('modalTitle').innerText = (data ? 'Edit Data ' : 'Tambah Data ') + table;
    
    const fieldsContainer = document.getElementById('formFields');
    fieldsContainer.innerHTML = '';
    
    const schema = TABLE_SCHEMAS[table] || [];
    
    schema.forEach(field => {
        const val = data ? (data[field.name] !== undefined ? data[field.name] : '') : '';
        const colSize = field.type === 'boolean' ? 'col-md-4' : 'col-md-6';
        
        let fieldHtml = '';
        if (field.type === 'select') {
            const opts = field.options.map(o => `<option value="${o}" ${val == o ? 'selected' : ''}>${o}</option>`).join('');
            fieldHtml = `
                <div class="${colSize}">
                    <label class="form-label">${field.label}</label>
                    <select class="form-select" name="${field.name}">${opts}</select>
                </div>`;
        } else if (field.type === 'boolean') {
            const isChecked = val === true || val === 'TRUE' || val === 1 || val === '1';
            fieldHtml = `
                <div class="${colSize} d-flex align-items-center mt-4">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="${field.name}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label">${field.label}</label>
                    </div>
                </div>`;
        } else {
            const readOnly = (data && field.primaryKey) ? 'readonly' : '';
            fieldHtml = `
                <div class="${colSize}">
                    <label class="form-label">${field.label}</label>
                    <input type="${field.type}" class="form-control" name="${field.name}" value="${val}" ${readOnly} ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}">
                </div>`;
        }
        fieldsContainer.insertAdjacentHTML('beforeend', fieldHtml);
    });
    
    crudModalInstance.show();
}

function editRow(table, id) {
    const pkName = TABLE_SCHEMAS[table].find(f => f.primaryKey).name;
    const item = (localData[table] || []).find(r => r[pkName] == id);
    if (item) {
        openModal(table, item);
    }
}

// ================= CRUD ACTIONS (POST TO GAS) =================
async function submitDynamicForm() {
    const table = document.getElementById('formTable').value;
    const action = document.getElementById('formAction').value;
    const form = document.getElementById('dynamicForm');
    const formData = new FormData(form);
    
    const payload = {
        action: action,
        table: table,
        data: {}
    };

    const schema = TABLE_SCHEMAS[table];
    schema.forEach(field => {
        if (field.type === 'boolean') {
            payload.data[field.name] = form.querySelector(`[name="${field.name}"]`).checked;
        } else {
            payload.data[field.name] = formData.get(field.name) || '';
        }
    });

    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        const res = await response.json();

        if (res.status === 'success') {
            crudModalInstance.hide();
            Swal.fire('Berhasil!', res.message || 'Data berhasil disimpan.', 'success');
            loadAllMasterData();
        } else {
            throw new Error(res.message || 'Gagal menyimpan data');
        }
    } catch (err) {
        Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
}

async function deleteRow(table, id) {
    const pkName = TABLE_SCHEMAS[table].find(f => f.primaryKey).name;
    const confirm = await Swal.fire({
        title: 'Hapus Data?',
        text: `Apakah Anda yakin ingin menghapus data dengan ${pkName}: ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
        Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const payload = {
                action: 'delete',
                table: table,
                data: { [pkName]: id }
            };

            const response = await fetch(GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const res = await response.json();

            if (res.status === 'success') {
                Swal.fire('Terhapus!', res.message || 'Data berhasil dihapus.', 'success');
                loadAllMasterData();
            } else {
                throw new Error(res.message || 'Gagal menghapus data');
            }
        } catch (err) {
            Swal.fire('Gagal Hapus', err.message, 'error');
        }
    }
}
