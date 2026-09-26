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
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Mapel', '${row.id_mapel}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Mapel', '${row.id_mapel}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    renderPaginationControls('Mapel', info, renderMapelTable);
}
