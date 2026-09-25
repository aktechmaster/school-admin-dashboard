function renderSiswaTable() {
    const tbody = document.querySelector('#table-siswa tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Siswa || []).map(row => `
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
}
