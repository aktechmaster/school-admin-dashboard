// ==========================================
// MODUL USER MANAGEMENT (PENGGUNA)
// ==========================================

// Helper pengecekan boolean ketat (mencegah string "FALSE" / "false" terbaca truthy)
function isTrueValue(val) {
    return val === true || val === 'TRUE' || val === 'true' || val === 1 || val === '1';
}

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

    // Map ID Guru ke Nama Guru untuk kemudahan identifikasi
    const mapGuru = {};
    (localData.Guru || []).forEach(g => { mapGuru[g.id_guru] = g.nama_lengkap; });

    tbody.innerHTML = info.data.map(row => {
        const namaGuruDisplay = row.id_guru 
            ? (mapGuru[row.id_guru] ? `${mapGuru[row.id_guru]} <small class="text-muted">(${row.id_guru})</small>` : row.id_guru) 
            : '-';
            
        // Pengecekan boolean ketat untuk badge status & role
        const statusBadge = isTrueValue(row.status_aktif) 
            ? '<span class="badge bg-success">Aktif</span>' 
            : '<span class="badge bg-danger">Nonaktif</span>';

        const parseText = (val) => isTrueValue(val) 
            ? '<span class="badge bg-success">Ya</span>' 
            : '<span class="badge bg-secondary opacity-50">Tidak</span>';

        return `
            <tr>
                <td><b>${row.id_user || ''}</b></td>
                <td>${row.username || ''}</td>
                <td>${namaGuruDisplay}</td>
                <td><span class="badge bg-info text-dark">${row.role || ''}</span></td>
                <td>${statusBadge}</td>
                <td>${parseText(row.is_wali_kelas)}</td>
                <td>${parseText(row.is_wakur)}</td>
                <td>${parseText(row.is_t2q)}</td>
                <td>${parseText(row.is_bpi)}</td>
                <td>${parseText(row.is_ekstra)}</td>
                <td>${renderActionButtons('Users', row.id_user)}</td>
            </tr>
        `;
    }).join('');

    // 3. Render Pagination
    renderPaginationControls('Users', info, renderUsersTable);
}

/**
 * Custom Export Excel Khusus Data Users
 */
function exportUsersExcel() {
    const data = localData.Users || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data pengguna untuk diekspor.', 'info');
    }

    const mapGuru = {};
    (localData.Guru || []).forEach(g => { mapGuru[g.id_guru] = g.nama_lengkap; });

    const formattedData = data.map((item, index) => ({
        'No': index + 1,
        'ID User': item.id_user || '-',
        'Username': item.username || '-',
        'Guru Terkait': mapGuru[item.id_guru] || item.id_guru || '-',
        'Role': item.role || '-',
        'Status': isTrueValue(item.status_aktif) ? 'Aktif' : 'Nonaktif',
        'Wali Kelas': isTrueValue(item.is_wali_kelas) ? 'Ya' : 'Tidak',
        'Wakur': isTrueValue(item.is_wakur) ? 'Ya' : 'Tidak',
        'T2Q': isTrueValue(item.is_t2q) ? 'Ya' : 'Tidak',
        'BPI': isTrueValue(item.is_bpi) ? 'Ya' : 'Tidak',
        'Ekstra': isTrueValue(item.is_ekstra) ? 'Ya' : 'Tidak'
    }));

    exportToExcel(formattedData, 'Data_User_Pengguna', 'Users');
}

/**
 * Custom Export PDF Khusus Data Users
 */
function exportUsersPDF() {
    exportTableToPDF('table-users', 'Laporan Data User Pengguna SDIT');
}
