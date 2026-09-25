function renderMapelTable() {
    const tbody = document.querySelector('#table-mapel tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Mapel || []).map(row => `
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
}
