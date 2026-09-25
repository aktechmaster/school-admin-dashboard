function renderKelasTable() {
    const tbody = document.querySelector('#table-kelas tbody');
    if (!tbody) return;

    const dataKelas = localData.Kelas || [];

    // 1. Penanganan data kosong
    if (dataKelas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    <i class="fas fa-info-circle me-1"></i> Belum ada data kelas.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = dataKelas.map(row => {
        // 2. Relasi ID Wali Kelas -> Nama Guru
        let waliKelasDisplay = '-';
        if (row.id_wali_kelas) {
            const guru = (localData.Guru || []).find(g => g.id_guru === row.id_wali_kelas);
            waliKelasDisplay = guru 
                ? `${guru.nama_lengkap} <small class="text-muted">(${guru.id_guru})</small>` 
                : row.id_wali_kelas;
        }

        return `
            <tr>
                <td><b>${row.id_kelas || '-'}</b></td>
                <td>${row.nama_kelas || '-'}</td>
                <td><span class="badge bg-secondary">Tingkat ${row.tingkat || '-'}</span></td>
                <td>${waliKelasDisplay}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-1" title="Edit Data" onclick="editRow('Kelas', '${row.id_kelas}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Hapus Data" onclick="deleteRow('Kelas', '${row.id_kelas}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}
