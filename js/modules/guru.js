// ==========================================
// MODUL MASTER GURU
// ==========================================

function renderGuruTable() {
    const tbody = document.querySelector('#table-guru tbody');
    if (!tbody) return;

    renderTableControls('Guru', [
        { field: 'jenis_kelamin', label: 'JK', options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
        { field: 'status_karyawan', label: 'Status', options: ['Tetap', 'Kontrak', 'Honorer'] }
    ], renderGuruTable);

    const info = getFilteredAndPaginatedData('Guru');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data guru tidak ditemukan.</td></tr>`;
        renderPaginationControls('Guru', info, renderGuruTable);
        return;
    }

    tbody.innerHTML = info.data.map(row => {
    // Membaca nilai dengan fallback alternatif key
    const jk = row.jenis_kelamin || row.jk || row.JK || '-';
    const status = row.status_karyawan || row.status || row.Status || '-';

    // Penentuan warna badge berdasarkan variabel fallback
    const jkBadge = jk === 'L' ? 'bg-primary' : (jk === 'P' ? 'bg-danger' : 'bg-secondary');
    const statusBadge = status === 'Tetap' ? 'bg-success' : (status === '-' ? 'bg-secondary' : 'bg-info text-dark');

    return `
        <tr>
            <td><b>${row.id_guru || '-'}</b></td>
            <td>${row.nip_nik || '-'}</td>
            <td>${row.nama_lengkap || '-'}</td>
            <td><span class="badge ${jkBadge}">${jk}</span></td>
            <td>${row.no_hp || '-'}</td>
            <td>${row.email || '-'}</td>
            <td>${row.jabatan || '-'}</td>
            <td><span class="badge ${statusBadge}">${status}</span></td>
            <td>${renderActionButtons('Guru', row.id_guru)}</td>
        </tr>
    `;
}).join('');

renderPaginationControls('Guru', info, renderGuruTable);

/**
 * Custom Export Excel Khusus Data Guru
 */
function exportGuruExcel() {
    const data = localData.Guru || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data guru untuk diekspor.', 'info');
    }

    const formattedData = data.map((item, index) => ({
        'No': index + 1,
        'ID Guru': item.id_guru || '-',
        'NIP / NIK': item.nip_nik || '-',
        'Nama Lengkap': item.nama_lengkap || '-',
        'L/P': item.jenis_kelamin || '-',
        'No. HP': item.no_hp || '-',
        'Email': item.email || '-',
        'Jabatan': item.jabatan || '-',
        'Status Karyawan': item.status_karyawan || '-'
    }));

    exportToExcel(formattedData, 'Data_Master_Guru', 'Guru');
}

/**
 * Custom Export PDF Khusus Data Guru
 */
function exportGuruPDF() {
    exportTableToPDF('table-guru', 'Laporan Data Guru SDIT');
}
