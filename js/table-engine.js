// Engine CRUD Dynamic, Filtering, Search, Paginasi & Pengurusan Form
let crudModalInstance;
let tableStates = {};

/**
 * Mendapatkan atau membuat state pencarian, filter, dan paginasi per tabel
 */
function getTableState(table) {
    if (!tableStates[table]) {
        tableStates[table] = {
            search: '',
            filters: {},
            currentPage: 1,
            pageSize: 10
        };
    }
    return tableStates[table];
}

/**
 * Definisi Filter Spesifik per Tabel Master
 */
function getTableFilters(table) {
    const filterSchemas = {
        Users: [
            { field: 'role', label: 'Semua Role', options: ['Admin', 'Kepsek', 'Guru', 'WaliKelas'] },
            { 
                field: 'status_aktif', 
                label: 'Semua Status Aktif', 
                options: [
                    { value: 'true', label: 'Aktif' },
                    { value: 'false', label: 'Non-Aktif' }
                ] 
            }
        ],
        Guru: [
            { field: 'jenis_kelamin', label: 'Semua JK', options: ['L', 'P'] },
            { field: 'status_karyawan', label: 'Semua Status Karyawan', options: ['Tetap', 'Kontrak', 'Honorer'] }
        ],
        Siswa: [
            { 
                field: 'id_kelas', 
                label: 'Semua Kelas', 
                options: (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: k.nama_kelas })) 
            },
            { field: 'jenis_kelamin', label: 'Semua JK', options: ['L', 'P'] },
            { field: 'status_siswa', label: 'Semua Status Siswa', options: ['Aktif', 'Lulus', 'Pindah', 'Keluar'] }
        ],
        Kelas: [
            { field: 'tingkat', label: 'Semua Tingkat', options: ['1', '2', '3', '4', '5', '6'] },
            { 
                field: 'id_wali_kelas', 
                label: 'Semua Wali Kelas', 
                options: (localData.Guru || []).map(g => ({ value: g.id_guru, label: g.nama_lengkap })) 
            }
        ],
        Mapel: [
            { field: 'kategori', label: 'Semua Kategori', options: ['Umum', 'Diniyah', 'Muatan Lokal', 'Ekstrakurikuler'] }
        ],
        Jadwal: [
            { field: 'hari', label: 'Semua Hari', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] },
            { 
                field: 'id_kelas', 
                label: 'Semua Kelas', 
                options: (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: k.nama_kelas })) 
            },
            { 
                field: 'id_guru', 
                label: 'Semua Guru Pengajar', 
                options: (localData.Guru || []).map(g => ({ value: g.id_guru, label: g.nama_lengkap })) 
            },
            { field: 'semester', label: 'Semua Semester', options: ['Ganjil', 'Genap'] }
        ]
    };

    return filterSchemas[table] || [];
}

/**
 * Mengambil Schema Table secara Dinamis
 * Membaca relational data (Guru, Kelas, Mapel) dari localData saat modal dibuka
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

/**
 * Filter Pipeline: Memproses pencarian & filter aktif dari localData
 */
function getFilteredData(table) {
    let rawData = localData[table] || [];
    const state = getTableState(table);

    // 1. Filter Pencarian Global
    if (state.search && state.search.trim() !== '') {
        const query = state.search.toLowerCase();
        rawData = rawData.filter(item => {
            return Object.values(item).some(val => 
                val !== null && val !== undefined && String(val).toLowerCase().includes(query)
            );
        });
    }

    // 2. Filter Spesifik Kolom Dropdown
    if (state.filters && Object.keys(state.filters).length > 0) {
        Object.keys(state.filters).forEach(field => {
            const filterValue = state.filters[field];
            if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
                rawData = rawData.filter(item => String(item[field]) === String(filterValue));
            }
        });
    }

    return rawData;
}

/**
 * Render Toolbar Control (Search Input, Dropdown Filters, Page Size)
 */
function renderTableControls(table) {
    const filters = getTableFilters(table);
    const state = getTableState(table);

    let filtersHTML = '';
    if (filters.length > 0) {
        filtersHTML = filters.map(f => {
            let optionsHTML = `<option value="">${f.label}</option>`;
            (f.options || []).forEach(opt => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optText = typeof opt === 'object' ? opt.label : opt;
                const selected = String(state.filters[f.field]) === String(optVal) ? 'selected' : '';
                optionsHTML += `<option value="${optVal}" ${selected}>${optText}</option>`;
            });

            return `
                <div class="col-auto">
                    <select class="form-select form-select-sm table-filter-select" 
                            data-table="${table}" 
                            data-field="${f.field}">
                        ${optionsHTML}
                    </select>
                </div>
            `;
        }).join('');
    }

    return `
        <div class="row g-2 mb-3 align-items-center justify-content-between">
            <div class="col-12 col-md-4">
                <div class="input-group input-group-sm">
                    <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                    <input type="text" 
                           class="form-control table-search-input" 
                           data-table="${table}" 
                           placeholder="Cari data ${table}..." 
                           value="${state.search || ''}">
                </div>
            </div>
            <div class="col-12 col-md-8 d-flex flex-wrap gap-2 justify-content-md-end align-items-center">
                ${filtersHTML}
                <div class="col-auto">
                    <select class="form-select form-select-sm table-pagesize-select" data-table="${table}">
                        <option value="5" ${state.pageSize === 5 ? 'selected' : ''}>5 baris</option>
                        <option value="10" ${state.pageSize === 10 ? 'selected' : ''}>10 baris</option>
                        <option value="25" ${state.pageSize === 25 ? 'selected' : ''}>25 baris</option>
                        <option value="50" ${state.pageSize === 50 ? 'selected' : ''}>50 baris</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Paginasi Bootstrap 5
 */
function renderPaginationControls(table, totalItems) {
    const state = getTableState(table);
    const totalPages = Math.ceil(totalItems / state.pageSize) || 1;

    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startItem = totalItems === 0 ? 0 : (state.currentPage - 1) * state.pageSize + 1;
    const endItem = Math.min(state.currentPage * state.pageSize, totalItems);

    let paginationLi = '';

    paginationLi += `
        <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage('${table}', ${state.currentPage - 1})">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            paginationLi += `
                <li class="page-item ${i === state.currentPage ? 'active' : ''}">
                    <button class="page-link" onclick="changePage('${table}', ${i})">${i}</button>
                </li>
            `;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            paginationLi += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    paginationLi += `
        <li class="page-item ${state.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage('${table}', ${state.currentPage + 1})">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </li>
    `;

    return `
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
            <small class="text-muted">
                Menampilkan <b>${startItem}</b> - <b>${endItem}</b> dari <b>${totalItems}</b> total data
            </small>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    ${paginationLi}
                </ul>
            </nav>
        </div>
    `;
}

/**
 * Helper untuk memformat tampilan sel tabel berdasarkan tipe schema
 */
function formatCellValue(schemaField, rawVal) {
    if (rawVal === undefined || rawVal === null || rawVal === '') return '-';

    if (schemaField.type === 'boolean') {
        const isTrue = rawVal === true || rawVal === 'TRUE' || rawVal === 1 || rawVal === '1';
        return isTrue 
            ? `<span class="badge bg-success-subtle text-success border border-success"><i class="fa-solid fa-check me-1"></i>Ya</span>`
            : `<span class="badge bg-secondary-subtle text-secondary border border-secondary"><i class="fa-solid fa-xmark me-1"></i>Tidak</span>`;
    }

    if (schemaField.type === 'password') {
        return `<span class="text-muted">••••••••</span>`;
    }

    if (schemaField.type === 'select' && Array.isArray(schemaField.options)) {
        const matchedOpt = schemaField.options.find(o => {
            const optVal = typeof o === 'object' ? o.value : o;
            return String(optVal) === String(rawVal);
        });
        if (matchedOpt && typeof matchedOpt === 'object') {
            return matchedOpt.label;
        }
    }

    return rawVal;
}

/**
 * Render Tabel Dinamis Lengkap (Search, Filter, Tabel, Aksi, & Paginasi)
 */
function renderDynamicTable(table, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const schema = getTableSchema(table);
    if (!schema || schema.length === 0) return;

    const pkField = schema.find(f => f.primaryKey);
    const pkName = pkField ? pkField.name : 'id';

    const filteredData = getFilteredData(table);
    const state = getTableState(table);

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + state.pageSize);

    // 1. Render Toolbar Controls
    let html = renderTableControls(table);

    // 2. Render Tabel
    html += `<div class="table-responsive"><table class="table table-hover table-striped align-middle border">`;
    html += `<thead class="table-light"><tr><th width="50">No</th>`;
    schema.forEach(field => {
        html += `<th>${field.label}</th>`;
    });
    html += `<th width="120" class="text-center">Aksi</th></tr></thead>`;

    html += `<tbody>`;
    if (paginatedData.length === 0) {
        html += `<tr><td colspan="${schema.length + 2}" class="text-center py-4 text-muted">Data tidak ditemukan</td></tr>`;
    } else {
        paginatedData.forEach((row, idx) => {
            const pkVal = row[pkName] !== undefined ? row[pkName] : '';
            html += `<tr>`;
            html += `<td>${startIndex + idx + 1}</td>`;
            schema.forEach(field => {
                const formattedVal = formatCellValue(field, row[field.name]);
                html += `<td>${formattedVal}</td>`;
            });

            html += `
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('${table}', '${pkVal}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('${table}', '${pkVal}')" title="Hapus">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            html += `</tr>`;
        });
    }
    html += `</tbody></table></div>`;

    // 3. Render Controls Paginasi
    html += renderPaginationControls(table, filteredData.length);

    container.innerHTML = html;
}

/**
 * Event Handler Paginasi
 */
function changePage(table, newPage) {
    const state = getTableState(table);
    state.currentPage = newPage;
    renderDynamicTable(table, `container-${table}`);
}

/**
 * Form Modal Handling & CRUD Functions
 */
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

// Global Event Delegation (Menjaga fokus input & sinkronisasi UI saat typing/filtering)
document.addEventListener('input', function (e) {
    if (e.target.classList.contains('table-search-input')) {
        const table = e.target.dataset.table;
        const state = getTableState(table);
        state.search = e.target.value;
        state.currentPage = 1;
        renderDynamicTable(table, `container-${table}`);
    }
});

document.addEventListener('change', function (e) {
    if (e.target.classList.contains('table-filter-select')) {
        const table = e.target.dataset.table;
        const field = e.target.dataset.field;
        const state = getTableState(table);
        state.filters[field] = e.target.value;
        state.currentPage = 1;
        renderDynamicTable(table, `container-${table}`);
    }

    if (e.target.classList.contains('table-pagesize-select')) {
        const table = e.target.dataset.table;
        const state = getTableState(table);
        state.pageSize = parseInt(e.target.value, 10);
        state.currentPage = 1;
        renderDynamicTable(table, `container-${table}`);
    }
});
