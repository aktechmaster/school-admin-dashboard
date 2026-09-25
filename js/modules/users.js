function renderUsersTable() {
    const tbody = document.querySelector('#table-users tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Users || []).map(row => `
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
}


