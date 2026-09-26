function renderUsersTable() {
    const tbody = document.querySelector('#table-users tbody');
    if (!tbody) return;

    // 1. Render Kontrol Search & Filter
    renderTableControls('Users', [
        { field: 'role', label: 'Role', options: ['Admin', 'Kepsek', 'Guru', 'WaliKelas'] },
        { field: 'status_aktif', label: 'Status', options: [{ value: 'true', label: 'Aktif' }, { value: 'false', label: 'Nonaktif' }] }
    ], renderUsersTable);

    // 2. Ambil Data Terfilter
    const info = getFilteredAndPaginatedData('Users');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data tidak ditemukan.</td></tr>`;
        renderPaginationControls('Users', info, renderUsersTable);
        return;
    }

    tbody.innerHTML = info.data.map(row => `
        <tr>
            <td><b>${row.id_user || ''}</b></td>
            <td>${row.username || ''}</td>
            <td>${row.id_guru || '-'}</td>
            <td><span class="badge bg-info">${row.role || ''}</span></td>
            <td>${row.status_aktif ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-danger">Nonaktif</span>'}</td>
            <td>${row.is_wali_kelas ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_wakur ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_t2q ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_bpi ? 'Ya' : 'Tidak'}</td>
            <td>${row.is_ekstra ? 'Ya' : 'Tidak'}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Users', '${row.id_user}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Users', '${row.id_user}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // 3. Render Pagination
    renderPaginationControls('Users', info, renderUsersTable);
}
