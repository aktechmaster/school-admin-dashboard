// ==========================================
// MODUL MASTER KELAS
// ==========================================
/**
 * Mengambil Struktur Skema Form Khusus Kelas
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
            label: 'Tingkat (1-12)', 
            type: 'select', 
            options: [
                { value: '1', label: 'Tingkat 1' },
                { value: '2', label: 'Tingkat 2' },
                { value: '3', label: 'Tingkat 3' },
                { value: '4', label: 'Tingkat 4' },
                { value: '5', label: 'Tingkat 5' },
                { value: '6', label: 'Tingkat 6' },
                { value: '7', label: 'Tingkat 7' },
                { value: '8', label: 'Tingkat 8' },
                { value: '9', label: 'Tingkat 9' },
                { value: '10', label: 'Tingkat 10' },
                { value: '11', label: 'Tingkat 11' },
                { value: '12', label: 'Tingkat 12' }
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
 * Render Tabel Data Kelas dengan Filter, Pagination, & Proteksi Hak Akses
 */
function renderKelasTable() {
    const tbody = document.querySelector('#table-kelas tbody');
    if (!tbody) return;

    // ✅ Filter diperluas sampai tingkat 12
    renderTableControls('Kelas', [
        { field: 'tingkat', label: 'Tingkat', options: ['1','2','3','4','5','6','7','8','9','10','11','12'] }
    ], renderKelasTable);

    const info = getFilteredAndPaginatedData('Kelas');
    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Belum ada data kelas.</td></tr>`;
        renderPaginationControls('Kelas', info, renderKelasTable);
        return;
    }
    tbody.innerHTML = info.data.map(row => {
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
                <td>${renderActionButtons('Kelas', row.id_kelas)}</td>
            </tr>
        `;
    }).join('');
    renderPaginationControls('Kelas', info, renderKelasTable);
}

/**
 * Custom Export Excel Khusus Data Kelas (Lookup Wali Kelas)
 */
function exportKelasExcel() {
    const data = localData.Kelas || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data kelas untuk diekspor.', 'info');
    }
    const mapGuru = {};
    (localData.Guru || []).forEach(g => { mapGuru[g.id_guru] = g.nama_lengkap; });
    const formattedData = data.map((item, index) => ({
        'No': index + 1,
        'ID Kelas': item.id_kelas || '-',
        'Nama Kelas': item.nama_kelas || '-',
        'Tingkat': item.tingkat || '-',
        'Wali Kelas': mapGuru[item.id_wali_kelas] || item.id_wali_kelas || '-'
    }));
    exportToExcel(formattedData, 'Data_Master_Kelas', 'Kelas');
}

/**
 * Custom Export PDF Khusus Data Kelas
 */
function exportKelasPDF() {
    exportTableToPDF('table-kelas', 'Laporan Data Kelas SDIT');
}
