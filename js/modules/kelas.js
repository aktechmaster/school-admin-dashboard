function renderKelasTable() {
    const tbody = document.querySelector('#table-kelas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Kelas || []).map(row => `
        <tr>
            <td><b>${row.id_kelas || ''}</b></td>
            <td>${row.nama_kelas || ''}</td>
            <td>Tingkat ${row.tingkat || ''}</td>
            <td>${row.id_wali_kelas || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Kelas', '${row.id_kelas}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Kelas', '${row.id_kelas}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
