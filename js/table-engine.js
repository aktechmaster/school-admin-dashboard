// Engine CRUD Dynamic & Pengurusan Form
let crudModalInstance;

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
            { name: 'id_mapel', label: 'ID Mapel', type: 'text', primaryKey: true },
            { name: 'kode_mapel', label: 'Kode Mapel', type: 'text' },
            { name: 'nama_mapel', label: 'Nama Mata Pelajaran', type: 'text', required: true },
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
    
    // Panggil schema dinamis
    const schema = getTableSchema(table);
    
    schema.forEach(field => {
        const val = data ? (data[field.name] !== undefined ? data[field.name] : '') : '';
        const colSize = field.type === 'boolean' ? 'col-md-4' : 'col-md-6';
        
        let fieldHtml = '';
        if (field.type === 'select') {
            // Mendukung array string biasa ['L', 'P'] DAN array objek [{value, label}]
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
    
    // Inisialisasi modal bootstrap jika belum ada
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
