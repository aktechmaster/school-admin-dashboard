// ==========================================
// MODUL MASTER SISWA
// ==========================================

function renderSiswaTable() {
    const tbody = document.querySelector('#table-siswa tbody');
    if (!tbody) return;

    const kelasOptions = (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: `${k.nama_kelas}` }));

    renderTableControls('Siswa', [
        { field: 'id_kelas', label: 'Kelas', options: kelasOptions },
        { field: 'status_siswa', label: 'Status', options: ['Aktif', 'Lulus', 'Pindah', 'Keluar'] }
    ], renderSiswaTable);

    const info = getFilteredAndPaginatedData('Siswa');

    if (info.data.length === 0) {
        // Colspan diubah menjadi 13 karena ada tambahan 2 kolom baru
        tbody.innerHTML = `<tr><td colspan="13" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data siswa tidak ditemukan.</td></tr>`;
        renderPaginationControls('Siswa', info, renderSiswaTable);
        return;
    }

    // Map data ID Kelas ke Nama Kelas untuk tampilan tabel
    const mapKelas = {};
    (localData.Kelas || []).forEach(k => { mapKelas[k.id_kelas] = k.nama_kelas; });

    tbody.innerHTML = info.data.map(row => {
        // Pengecekan fallback serbaguna (Membaca format DB & format impor Excel)
        const jk = row.jenis_kelamin || row.jk || row.JK || '-';
        const kelas = mapKelas[row.id_kelas] || row.kelas || row.Kelas || row.id_kelas || '-';
        const ayah = row.nama_ayah || row.ayah || row.Ayah || '-';
        const pekerjaanAyah = row.pekerjaan_ayah || row['Pekerjaan Ayah'] || '-';
        const ibu = row.nama_ibu || row.ibu || row.Ibu || '-';
        const pekerjaanIbu = row.pekerjaan_ibu || row['Pekerjaan Ibu'] || '-';
        const status = row.status_siswa || row.status || row.Status || 'Aktif';

        return `
            <tr>
                <td><b>${row.id_siswa || ''}</b></td>
                <td>${row.nisn || '-'}</td>
                <td>${row.nis || '-'}</td>
                <td>${row.nama_siswa || ''}</td>
                <td>${jk}</td>
                <td>${kelas}</td>
                <td>${ayah}</td>
                <td>${pekerjaanAyah}</td>
                <td>${ibu}</td>
                <td>${pekerjaanIbu}</td>
                <td>${row.no_hp_ortu || row['No HP Ortu'] || '-'}</td>
                <td><span class="badge bg-primary">${status}</span></td>
                <td>${renderActionButtons('Siswa', row.id_siswa)}</td>
            </tr>
        `;
    }).join('');

    renderPaginationControls('Siswa', info, renderSiswaTable);
}

/**
 * Custom Export Excel Khusus Data Siswa
 */
function exportSiswaExcel() {
    const data = localData.Siswa || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data siswa untuk diekspor.', 'info');
    }

    const mapKelas = {};
    (localData.Kelas || []).forEach(k => { mapKelas[k.id_kelas] = k.nama_kelas; });

    const formattedData = data.map((item, index) => ({
        'No': index + 1,
        'ID Siswa': item.id_siswa || '',
        'NISN': item.nisn || '-',
        'NIS': item.nis || '-',
        'Nama Siswa': item.nama_siswa || '',
        'L/P': item.jenis_kelamin || item.jk || item.JK || '-',
        'Kelas': mapKelas[item.id_kelas] || item.kelas || item.Kelas || item.id_kelas || '-',
        'Nama Ayah': item.nama_ayah || item.ayah || item.Ayah || '-',
        'Pekerjaan Ayah': item.pekerjaan_ayah || item['Pekerjaan Ayah'] || '-',
        'Nama Ibu': item.nama_ibu || item.ibu || item.Ibu || '-',
        'Pekerjaan Ibu': item.pekerjaan_ibu || item['Pekerjaan Ibu'] || '-',
        'No. HP Ortu': item.no_hp_ortu || item['No HP Ortu'] || '-',
        'Status': item.status_siswa || item.status || item.Status || 'Aktif'
    }));

    exportToExcel(formattedData, 'Data_Master_Siswa', 'Siswa');
}

/**
 * Custom Export PDF Khusus Data Siswa
 */
function exportSiswaPDF() {
    exportTableToPDF('table-siswa', 'Laporan Data Siswa SDIT');
}
