// js/modules/kelas.js

/**
 * Mengambil konfigurasi bidang form untuk Kelas.
 * Memuat daftar Guru secara dinamis dari localData.Guru.
 */
function getKelasFormFields() {
    const guruList = localData.Guru || [];
    const guruOptions = guruList.map(g => ({
        value: g.id_guru,
        label: `${g.nama_lengkap} (${g.id_guru})`
    }));

    return [
        { 
            name: 'id_kelas', 
            label: 'ID Kelas', 
            type: 'text', 
            placeholder: 'Contoh: KLS-1A atau K1-ABU', 
            required: true,
            primaryKey: true
        },
        { 
            name: 'nama_kelas', 
            label: 'Nama Kelas', 
            type: 'text', 
            placeholder: 'Contoh: 1 Abu Bakar', 
            required: true 
        },
        { 
            name: 'tingkat', 
            label: 'Tingkat (1-6)', 
            type: 'select', 
            options: [
                { value: '1', label: 'Tingkat 1' },
                { value: '2', label: 'Tingkat 2' },
                { value: '3', label: 'Tingkat 3' },
                { value: '4', label: 'Tingkat 4' },
                { value: '5', label: 'Tingkat 5' },
                { value: '6', label: 'Tingkat 6' }
            ],
            required: true 
        },
        { 
            name: 'id_wali_kelas', 
            label: 'Wali Kelas', 
            type: 'select', 
            options: [
                { value: '', label: '-- Pilih Wali Kelas --' },
                ...guruOptions
            ] 
        }
    ];
}

/**
 * Render Tabel Master Kelas
 */
function renderKelasTable() {
    const tbody = document.querySelector('#table-kelas tbody');
    if (!tbody) return;

    const dataKelas = localData.Kelas || [];

    if (dataKelas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    <i class="fas fa-info-circle me-1"></i> Belum ada data kelas.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = dataKelas.map(row => {
        let waliKelasDisplay = '-';
        if (row.id_wali_kelas) {
            const guru = (localData.Guru || []).find(g => g.id_guru === row.id_wali_kelas);
            waliKelasDisplay = guru 
                ? `${guru.nama_lengkap} <small class="text-muted">(${guru.id_guru})</small>` 
                : row.id_wali_kelas;
        }

        return `
            <tr>
                <td><b>${row.id_kelas || '-'}</b></td>
                <td>${row.nama_kelas || '-'}</td>
                <td><span class="badge bg-secondary">Tingkat ${row.tingkat || '-'}</span></td>
                <td>${waliKelasDisplay}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-1" title="Edit Data" onclick="editRow('Kelas', '${row.id_kelas}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="deleteRow('Kelas', '${row.id_kelas}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}
