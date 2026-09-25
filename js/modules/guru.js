function renderGuruTable() {
    const tbody = document.querySelector('#table-guru tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Guru || []).map(row => `
        <tr>
            <td><b>${row.id_guru || ''}</b></td>
            <td>${row.nip_nik || '-'}</td>
            <td>${row.nama_lengkap || ''}</td>
            <td>${row.jenis_kelamin || ''}</td>
            <td>${row.no_hp || ''}</td>
            <td>${row.email || ''}</td>
            <td>${row.jabatan || ''}</td>
            <td><span class="badge bg-secondary">${row.status_karyawan || ''}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Guru', '${row.id_guru}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Guru', '${row.id_guru}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
