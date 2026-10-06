// ==========================================
// MODUL JADWAL PELAJARAN
// ==========================================

function renderJadwalTable() {
    const tbody = document.querySelector('#table-jadwal tbody');
    if (!tbody) return;

    // Menyiapkan opsi dropdown filter kelas
    const kelasOptions = (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: k.nama_kelas }));

    renderTableControls('Jadwal', [
        { field: 'hari', label: 'Hari', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] },
        { field: 'id_kelas', label: 'Kelas', options: kelasOptions },
        { field: 'semester', label: 'Semester', options: ['Ganjil', 'Genap'] }
    ], renderJadwalTable);

    const info = getFilteredAndPaginatedData('Jadwal');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data jadwal tidak ditemukan.</td></tr>`;
        renderPaginationControls('Jadwal', info, renderJadwalTable);
        return;
    }

    // Mapping ID ke Nama untuk kemudahan pembacaan data di tabel
    const mapKelas = {};
    (localData.Kelas || []).forEach(k => { mapKelas[k.id_kelas] = k.nama_kelas; });

    const mapMapel = {};
    (localData.Mapel || []).forEach(m => { mapMapel[m.id_mapel] = m.nama_mapel; });

    const mapGuru = {};
    (localData.Guru || []).forEach(g => { mapGuru[g.id_guru] = g.nama_lengkap; });

    tbody.innerHTML = info.data.map(row => {
        const kelasDisplay = mapKelas[row.id_kelas] || row.id_kelas || '-';
        const mapelDisplay = mapMapel[row.id_mapel] || row.id_mapel || '-';
        const guruDisplay = mapGuru[row.id_guru] || row.id_guru || '-';

        return `
            <tr>
                <td><b>${row.id_jadwal || ''}</b></td>
                <td>${row.hari || ''}</td>
                <td>Jam Ke-${row.jam_ke || ''}</td>
                <td>${kelasDisplay}</td>
                <td>${mapelDisplay}</td>
                <td>${guruDisplay}</td>
                <td>${row.tahun_ajaran || ''}</td>
                <td>Semester ${row.semester || ''}</td>
                <td>${renderActionButtons('Jadwal', row.id_jadwal)}</td>
            </tr>
        `;
    }).join('');

    renderPaginationControls('Jadwal', info, renderJadwalTable);
}

/**
 * Custom Export Excel Khusus Data Jadwal Pelajaran
 */
function exportJadwalExcel() {
    const data = localData.Jadwal || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data jadwal untuk diekspor.', 'info');
    }

    const mapKelas = {};
    (localData.Kelas || []).forEach(k => { mapKelas[k.id_kelas] = k.nama_kelas; });

    const mapMapel = {};
    (localData.Mapel || []).forEach(m => { mapMapel[m.id_mapel] = m.nama_mapel; });

    const mapGuru = {};
    (localData.Guru || []).forEach(g => { mapGuru[g.id_guru] = g.nama_lengkap; });

    const formattedData = data.map((item, index) => ({
        'No': index + 1,
        'ID Jadwal': item.id_jadwal || '-',
        'Hari': item.hari || '-',
        'Jam Ke': item.jam_ke ? `Jam ke-${item.jam_ke}` : '-',
        'Kelas': mapKelas[item.id_kelas] || item.id_kelas || '-',
        'Mata Pelajaran': mapMapel[item.id_mapel] || item.id_mapel || '-',
        'Guru Pengajar': mapGuru[item.id_guru] || item.id_guru || '-',
        'Tahun Ajaran': item.tahun_ajaran || '-',
        'Semester': item.semester || '-'
    }));

    exportToExcel(formattedData, 'Data_Jadwal_Pelajaran', 'Jadwal');
}

/**
 * Custom Export PDF Khusus Data Jadwal Pelajaran
 */
function exportJadwalPDF() {
    exportTableToPDF('table-jadwal', 'Laporan Jadwal Pelajaran SDIT');
}
