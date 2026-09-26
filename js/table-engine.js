// Engine CRUD Dynamic & Pengurusan Form
let crudModalInstance;

// State Global untuk Filter, Search, dan Pagination per Tabel
let tableState = {
    Users: { search: '', filter: {}, page: 1, limit: 10 },
    Guru: { search: '', filter: {}, page: 1, limit: 10 },
    Siswa: { search: '', filter: {}, page: 1, limit: 10 },
    Kelas: { search: '', filter: {}, page: 1, limit: 10 },
    Mapel: { search: '', filter: {}, page: 1, limit: 10 },
    Jadwal: { search: '', filter: {}, page: 1, limit: 10 }
};

/**
 * Mengambil Schema Table secara Dinamis
 */
function getTableSchema(table) {
    const schemas = {
        Users: [
            { name: 'id_user', label: 'ID User', type: 'text', primaryKey: true },
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'password_hash', label: 'Password / Hash', type: 'password' },
            { 
                name: 'id_guru', 
                label: 'Guru Tautan', 
                type: 'select', 
                options: [
                    { value: '', label: '-- Pilih Guru (Opsional) --' },
                    ...(localData.Guru || []).map(g => ({ value: g.id_guru, label: `${g.nama_lengkap} (${g.id_guru})` }))
                ] 
            },
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
            { name: 'jabatan', label: 'Jabatan', type: 'text', placeholder: 'Contoh: Guru Kelas / Wakur' },
            { name: 'status_karyawan', label: 'Status Karyawan', type: 'select', options: ['Tetap', 'Kontrak', 'Honorer'] }
        ],
        Siswa: [
            { name: 'id_siswa', label: 'ID Siswa', type: 'text', primaryKey: true },
            { name: 'nisn', label: 'NISN', type: 'text' },
            { name: 'nis', label: 'NIS', type: 'text' },
            { name: 'nama_siswa', label: 'Nama Siswa', type: 'text', required: true },
            { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'] },
            { 
                name: 'id_kelas', 
                label: 'Kelas', 
                type: 'select', 
                options: [
                    { value: '', label: '-- Pilih Kelas --' },
                    ...(localData.Kelas || []).map(k => ({ value: k.id_kelas, label: `${k.nama_kelas} (${k.id_kelas})` }))
                ] 
            },
            { name: 'nama_ayah', label: 'Nama Ayah', type: 'text' },
            { name: 'pekerjaan_ayah', label: 'Pekerjaan Ayah', type: 'text' },
            { name: 'nama_ibu', label: 'Nama Ibu', type: 'text' },
            { name: 'pekerjaan_ibu', label: 'Pekerjaan Ibu', type: 'text' },
            { name: 'no_hp_ortu', label: 'No HP Orang Tua', type: 'text' },
            { name: 'status_siswa', label: 'Status Siswa', type: 'select', options: ['Aktif', 'Lulus', 'Pindah', 'Keluar'] }
        ],
        Kelas: [
            { name: 'id_kelas', label: 'ID Kelas', type: 'text', primaryKey: true, placeholder: 'Contoh: KLS-1A' },
            { name: 'nama_kelas', label: 'Nama Kelas', type: 'text', required: true, placeholder: 'Contoh: 1 Abu Bakar' },
            { name: 'tingkat', label: 'Tingkat (1-6)', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
            { 
                name: 'id_wali_kelas', 
                label: 'Wali Kelas', 
                type: 'select', 
                options: [
                    { value: '', label: '-- Pilih Wali Kelas --' },
                    ...(localData.Guru || []).map(g => ({ value: g.id_guru, label: `${g.nama_lengkap} (${g.id_guru})` }))
                ] 
            }
        ],
        Mapel: [
            { name: 'id_mapel', label: 'ID Mapel', type: 'text', primaryKey: true, placeholder: 'Contoh: MP-001 atau MPL-MTK' },
            { name: 'kode_mapel', label: 'Kode Mapel', type: 'text', placeholder: 'Contoh: MTK / PAI' },
            { name: 'nama_mapel', label: 'Nama Mata Pelajaran', type: 'text', required: true, placeholder: 'Contoh: Matematika' },
            { name: 'kategori', label: 'Kategori', type: 'select', options: ['Umum', 'Diniyah', 'Muatan Lokal', 'Ekstrakurikuler'] }
        ],
        Jadwal: [
            { name: 'id_jadwal', label: 'ID Jadwal', type: 'text', primaryKey: true },
            { name: 'hari', label: 'Hari', type: 'select', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] },
            { name: 'jam_ke', label: 'Jam Ke', type: 'number' },
            { 
                name: 'id_kelas', 
                label: 'Kelas', 
                type: 'select', 
                options: [
                    { value: '', label: '-- Pilih Kelas --' },
                    ...(localData.Kelas || []).map(k => ({ value: k.id_kelas, label: `${k.nama_kelas} (${k.id_kelas})` }))
                ] 
            },
            { 
                name: 'id_mapel', 
                label: 'Mata Pelajaran', 
                type: 'select', 
                options: [
                    { value: '', label: '-- Pilih Mapel --' },
                    ...(localData.Mapel || []).map(m => ({ value: m.id_mapel, label: `${m.nama_mapel} (${m.id_mapel})` }))
                ] 
            },
            { 
                name: 'id_guru', 
                label: 'Guru Pengajar', 
                type: 'select', 
                options: [
                    { value: '', label: '-- Pilih Guru --' },
                    ...(localData.Guru || []).map(g => ({ value: g.id_guru, label: `${g.nama_lengkap} (${g.id_guru})` }))
                ] 
            },
            { name: 'tahun_ajaran', label: 'Tahun Ajaran', type: 'text', placeholder: '2026/2027' },
            { name: 'semester', label: 'Semester', type: 'select', options: ['Ganjil', 'Genap'] }
        ]
    };

    return schemas[table] || [];
}

function openModal(table, data = null) {
    document.getElementById('formTable').value = table;
    document.getElementById('formAction').value = data ? 'update' : 'create';
    document.getElementById('modalTitle').innerText = (data ? 'Edit Data ' : 'Tambah Data ') + table;
    
    const fieldsContainer = document.getElementById('formFields');
    fieldsContainer.innerHTML = '';
    
    const schema = getTableSchema(table);
    
    schema.forEach(field => {
        const val = data ? (data[field.name] !== undefined ? data[field.name] : '') : '';
        const colSize = field.type === 'boolean' ? 'col-md-4' : 'col-md-6';
        
        let fieldHtml = '';
        if (field.type === 'select') {
            const opts = (field.options || []).map(o => {
                const optVal = typeof o === 'object' ? o.value : o;
                const optLabel = typeof o === 'object' ? o.label : o;
                const selected = String(val) === String(optVal) ? 'selected' : '';
                return `<option value="${optVal}" ${selected}>${optLabel}</option>`;
            }).join('');

            fieldHtml = `
                <div class="${colSize}">
                    <label class="form-label fw-bold">${field.label}</label>
                    <select class="form-select" name="${field.name}">${opts}</select>
                </div>`;
        } else if (field.type === 'boolean') {
            const isChecked = val === true || val === 'TRUE' || val === 1 || val === '1';
            fieldHtml = `
                <div class="${colSize} d-flex align-items-center mt-4">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="${field.name}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label fw-bold">${field.label}</label>
                    </div>
                </div>`;
        } else {
            const readOnly = (data && field.primaryKey) ? 'readonly' : '';
            fieldHtml = `
                <div class="${colSize}">
                    <label class="form-label fw-bold">${field.label}</label>
                    <input type="${field.type}" class="form-control" name="${field.name}" value="${val}" ${readOnly} ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}">
                </div>`;
        }
        fieldsContainer.insertAdjacentHTML('beforeend', fieldHtml);
    });
    
    if (!crudModalInstance) {
        const modalEl = document.getElementById('crudModal');
        if (modalEl) crudModalInstance = new bootstrap.Modal(modalEl);
    }
    
    if (crudModalInstance) crudModalInstance.show();
}

function editRow(table, id) {
    const schema = getTableSchema(table);
    const pkField = schema.find(f => f.primaryKey);
    if (!pkField) return;

    const pkName = pkField.name;
    const item = (localData[table] || []).find(r => String(r[pkName] || r.id) === String(id));
    if (item) {
        openModal(table, item);
    }
}

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

    const schema = getTableSchema(table);
    schema.forEach(field => {
        if (field.type === 'boolean') {
            const el = form.querySelector(`[name="${field.name}"]`);
            payload.data[field.name] = el ? el.checked : false;
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
            if (crudModalInstance) crudModalInstance.hide();
            Swal.fire('Berhasil!', res.message || 'Data berhasil disimpan.', 'success');
            if (typeof loadAllMasterData === 'function') loadAllMasterData();
        } else {
            throw new Error(res.message || 'Gagal menyimpan data');
        }
    } catch (err) {
        Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
}

async function deleteRow(table, id) {
    const schema = getTableSchema(table);
    const pkField = schema.find(f => f.primaryKey);
    if (!pkField) return;

    const pkName = pkField.name;
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
                if (typeof loadAllMasterData === 'function') loadAllMasterData();
            } else {
                throw new Error(res.message || 'Gagal menghapus data');
            }
        } catch (err) {
            Swal.fire('Gagal Hapus', err.message, 'error');
        }
    }
}

/* ==========================================================================
   ENGINE SEARCH, FILTER & PAGINATION ENGINE
   ========================================================================== */

/**
 * Memproses data localData[table] berdasarkan parameter pencarian, filter, dan pagination
 */
function getFilteredAndPaginatedData(table) {
    if (!tableState[table]) {
        tableState[table] = { search: '', filter: {}, page: 1, limit: 10 };
    }
    const state = tableState[table];
    let data = [...(localData[table] || [])];

    // 1. Pencarian Real-time Global
    if (state.search) {
        const q = state.search.toLowerCase();
        data = data.filter(item => {
            return Object.values(item).some(val => 
                val !== null && val !== undefined && String(val).toLowerCase().includes(q)
            );
        });
    }

    // 2. Filter Dropdown Spesifik
    Object.keys(state.filter).forEach(key => {
        const filterVal = state.filter[key];
        if (filterVal !== undefined && filterVal !== null && filterVal !== '') {
            data = data.filter(item => String(item[key]) === String(filterVal));
        }
    });

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / state.limit) || 1;

    if (state.page > totalPages) state.page = 1;

    const start = (state.page - 1) * state.limit;
    const paginatedData = data.slice(start, start + state.limit);

    return {
        data: paginatedData,
        totalItems,
        totalPages,
        currentPage: state.page,
        limit: state.limit,
        startIndex: totalItems > 0 ? start + 1 : 0,
        endIndex: Math.min(start + state.limit, totalItems)
    };
}

/**
 * Menyuntikkan Komponen Filter & Input Pencarian di atas Tabel
 */
function renderTableControls(table, filterConfigs = [], renderCallback) {
    const tableEl = document.querySelector(`#table-${table.toLowerCase()}`);
    if (!tableEl) return;

    let controlsEl = document.getElementById(`controls-${table.toLowerCase()}`);
    
    // JIKA CONTROLS SUDAH ADA DI DOM:
    // Hentikan eksekusi agar tidak meng-overwrite innerHTML.
    // Hal ini menjaga elemen input tetap utuh sehingga kursor/fokus ketikan tidak hilang.
    if (controlsEl) return;

    controlsEl = document.createElement('div');
    controlsEl.id = `controls-${table.toLowerCase()}`;
    controlsEl.className = 'row g-2 mb-3 align-items-center';
    tableEl.parentNode.insertBefore(controlsEl, tableEl);

    const state = tableState[table];

    // Buat HTML Dropdown Filter
    const filterHtml = filterConfigs.map(cfg => {
        const optsHtml = cfg.options.map(opt => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const selected = String(state.filter[cfg.field] || '') === String(val) ? 'selected' : '';
            return `<option value="${val}" ${selected}>${label}</option>`;
        }).join('');

        return `
            <div class="col-md-3 col-6">
                <select class="form-select form-select-sm" onchange="updateTableFilter('${table}', '${cfg.field}', this.value, ${renderCallback.name})">
                    <option value="">-- All ${cfg.label} --</option>
                    ${optsHtml}
                </select>
            </div>
        `;
    }).join('');

    controlsEl.innerHTML = `
        <div class="col-md-4">
            <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" class="form-control" placeholder="Cari data ${table}..." value="${state.search}" oninput="updateTableSearch('${table}', this.value, ${renderCallback.name})">
            </div>
        </div>
        ${filterHtml}
        <div class="col-md-2 col-6 ms-auto">
            <select class="form-select form-select-sm" onchange="updateTableLimit('${table}', this.value, ${renderCallback.name})">
                <option value="5" ${state.limit == 5 ? 'selected' : ''}>5 data/hal</option>
                <option value="10" ${state.limit == 10 ? 'selected' : ''}>10 data/hal</option>
                <option value="25" ${state.limit == 25 ? 'selected' : ''}>25 data/hal</option>
                <option value="50" ${state.limit == 50 ? 'selected' : ''}>50 data/hal</option>
            </select>
        </div>
    `;
}

/**
 * Menyuntikkan Komponen Pagination di bawah Tabel
 */
function renderPaginationControls(table, info, renderCallback) {
    const tableEl = document.querySelector(`#table-${table.toLowerCase()}`);
    if (!tableEl) return;

    let pagEl = document.getElementById(`pagination-${table.toLowerCase()}`);
    if (!pagEl) {
        pagEl = document.createElement('div');
        pagEl.id = `pagination-${table.toLowerCase()}`;
        pagEl.className = 'd-flex justify-content-between align-items-center mt-3 flex-wrap gap-2';
        tableEl.parentNode.insertBefore(pagEl, tableEl.nextSibling);
    }

    let buttonsHtml = '';
    const maxPage = info.totalPages;
    const curPage = info.currentPage;

    buttonsHtml += `
        <li class="page-item ${curPage === 1 ? 'disabled' : ''}">
            <button class="page-link page-link-sm" onclick="changeTablePage('${table}', ${curPage - 1}, ${renderCallback.name})">Prev</button>
        </li>
    `;

    for (let i = 1; i <= maxPage; i++) {
        if (i === 1 || i === maxPage || (i >= curPage - 1 && i <= curPage + 1)) {
            buttonsHtml += `
                <li class="page-item ${i === curPage ? 'active' : ''}">
                    <button class="page-link page-link-sm" onclick="changeTablePage('${table}', ${i}, ${renderCallback.name})">${i}</button>
                </li>
            `;
        } else if (i === curPage - 2 || i === curPage + 2) {
            buttonsHtml += `<li class="page-item disabled"><span class="page-link page-link-sm">...</span></li>`;
        }
    }

    buttonsHtml += `
        <li class="page-item ${curPage === maxPage || maxPage === 0 ? 'disabled' : ''}">
            <button class="page-link page-link-sm" onclick="changeTablePage('${table}', ${curPage + 1}, ${renderCallback.name})">Next</button>
        </li>
    `;

    pagEl.innerHTML = `
        <div class="small text-muted">
            Menampilkan <b>${info.startIndex}</b> - <b>${info.endIndex}</b> dari <b>${info.totalItems}</b> data
        </div>
        <nav>
            <ul class="pagination pagination-sm mb-0">
                ${buttonsHtml}
            </ul>
        </nav>
    `;
}

// Handler event pencarian, filter, dan pagination
function updateTableSearch(table, val, callback) {
    tableState[table].search = val;
    tableState[table].page = 1;
    if (typeof callback === 'function') callback();
}

function updateTableFilter(table, field, val, callback) {
    tableState[table].filter[field] = val;
    tableState[table].page = 1;
    if (typeof callback === 'function') callback();
}

function updateTableLimit(table, val, callback) {
    tableState[table].limit = parseInt(val, 10);
    tableState[table].page = 1;
    if (typeof callback === 'function') callback();
}

function changeTablePage(table, newPage, callback) {
    tableState[table].page = newPage;
    if (typeof callback === 'function') callback();
}

/**
 * Pembantu Pembatasan Tombol Aksi berdasarkan Role
 */
function renderActionButtons(tableName, primaryKeyValue) {
    if (!currentUser || currentUser.role !== 'Admin') {
        return `<span class="badge bg-light text-muted"><i class="fas fa-lock me-1"></i>Read Only</span>`;
    }

    return `
        <button class="btn btn-sm btn-outline-warning me-1" title="Edit Data" onclick="editRow('${tableName}', '${primaryKeyValue}')">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="deleteRow('${tableName}', '${primaryKeyValue}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
}
