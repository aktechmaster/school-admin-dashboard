function renderJadwalTable() {
    const tbody = document.querySelector('#table-jadwal tbody');
    if (!tbody) return;
    
    tbody.innerHTML = (localData.Jadwal || []).map(row => `
        <tr>
            <td><b>${row.id_jadwal || ''}</b></td>
            <td>${row.hari || ''}</td>
            <td>Jam Ke-${row.jam_ke || ''}</td>
            <td>${row.id_kelas || ''}</td>
            <td>${row.id_mapel || ''}</td>
            <td>${row.id_guru || ''}</td>
            <td>${row.tahun_ajaran || ''}</td>
            <td>Semester ${row.semester || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editRow('Jadwal', '${row.id_jadwal}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRow('Jadwal', '${row.id_jadwal}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
