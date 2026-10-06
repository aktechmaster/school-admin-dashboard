// ==========================================
// MODUL MASTER MATA PELAJARAN (MAPEL)
// ==========================================

function renderMapelTable() {
    const tbody = document.querySelector('#table-mapel tbody');
    if (!tbody) return;

    renderTableControls('Mapel', [
        { field: 'kategori', label: 'Kategori', options: ['Umum', 'Diniyah', 'Muatan Lokal', 'Ekstrakurikuler'] }
    ], renderMapelTable);

    const info = getFilteredAndPaginatedData('Mapel');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data mapel tidak ditemukan.</td></tr>`;
        renderPaginationControls('Mapel', info, renderMapelTable);
        return;
    }

    tbody.innerHTML = info.data.map(row => `
        <tr>
            <td><b>${row.id_mapel || ''}</b></td>
            <td>${row.kode_mapel || ''}</td>
            <td>${row.nama_mapel || ''}</td>
            <td><span class="badge bg-info text-dark">${row.kategori || 'Umum'}</span></td>
            <td>${renderActionButtons('Mapel', row.id_mapel)}</td>
        </tr>
    `).join('');

    renderPaginationControls('Mapel', info, renderMapelTable);
}

/**
 * Custom Export Excel Khusus Data Mata Pelajaran
 */
function exportMapelExcel() {
    const data = localData.Mapel || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data mata pelajaran untuk diekspor.', 'info');
    }

    const formattedData = data.map((item, index) => ({
        'No': index + 1,
        'ID Mapel': item.id_mapel || '-',
        'Kode Mapel': item.kode_mapel || '-',
        'Nama Mata Pelajaran': item.nama_mapel || '-',
        'Kategori': item.kategori || 'Umum'
    }));

    exportToExcel(formattedData, 'Data_Master_Mapel', 'Mapel');
}

/**
 * Custom Export PDF Khusus Data Mata Pelajaran
 */
function exportMapelPDF() {
    exportTableToPDF('table-mapel', 'Laporan Data Mata Pelajaran SDIT');
}
