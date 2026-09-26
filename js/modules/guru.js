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
        const jkBadge = row.jenis_kelamin === 'L' ? 'bg-primary' : (row.jenis_kelamin === 'P' ? 'bg-danger' : 'bg-secondary');
        const statusBadge = row.status_karyawan === 'Tetap' ? 'bg-success' : 'bg-info text-dark';

        return `
            <tr>
                <td><b>${row.id_guru || '-'}</b></td>
                <td>${row.nip_nik || '-'}</td>
                <td>${row.nama_lengkap || '-'}</td>
                <td><span class="badge ${jkBadge}">${row.jenis_kelamin || '-'}</span></td>
                <td>${row.no_hp || '-'}</td>
                <td>${row.email || '-'}</td>
                <td>${row.jabatan || '-'}</td>
                <td><span class="badge ${statusBadge}">${row.status_karyawan || '-'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-1" title="Edit Data" onclick="editRow('Guru', '${row.id_guru}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="deleteRow('Guru', '${row.id_guru}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    renderPaginationControls('Guru', info, renderGuruTable);
}
