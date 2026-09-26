function renderSiswaTable() {
    const tbody = document.querySelector('#table-siswa tbody');
    if (!tbody) return;

    const kelasOptions = (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: `${k.nama_kelas}` }));

    renderTableControls('Siswa', [
        { field: 'id_kelas', label: 'Kelas', options: kelasOptions },
        { field: 'status_siswa', label: 'Status', options: ['Aktif', 'Lulus', 'Pindah', 'Keluar'] }
    ], renderSiswaTable);

    const info = getFilteredAndPaginatedData('Siswa');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data siswa tidak ditemukan.</td></tr>`;
        renderPaginationControls('Siswa', info, renderSiswaTable);
        return;
    }

    tbody.innerHTML = info.data.map(row => `
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

    renderPaginationControls('Siswa', info, renderSiswaTable);
}
