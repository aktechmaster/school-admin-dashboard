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
 * Membuka Modal Matriks Jadwal Kelas, Mengaktifkan Fitur Draggable, & Mengisi Dropdown Kelas
 */
function openModalGridJadwal() {
    // Reset posisi modal dialog ke posisi awal (tengah) setiap kali dibuka
    const modalDialog = document.querySelector('#modalGridJadwal .modal-dialog');
    if (modalDialog) {
        modalDialog.style.position = '';
        modalDialog.style.left = '';
        modalDialog.style.top = '';
        modalDialog.style.margin = '';
    }

    const selectKelas = document.getElementById('grid-select-kelas');
    if (!selectKelas) return;

    // Reset dan isi opsi kelas
    selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
        (localData.Kelas || []).map(k => `<option value="${k.id_kelas}">${k.nama_kelas}</option>`).join('');

    // Reset grid ke tampilan kosong
    document.getElementById('tbody-grid-jadwal').innerHTML = `
        <tr>
            <td colspan="6" class="text-muted py-4">Silakan pilih kelas di atas terlebih dahulu untuk menampilkan grid jadwal.</td>
        </tr>
    `;

    // Inisialisasi fitur geser (Draggable) pada modal matriks
    if (typeof makeModalDraggable === 'function') {
        makeModalDraggable('modalGridJadwal');
    }

    // Tampilkan Modal
    const modalEl = document.getElementById('modalGridJadwal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * Generasi Tabel Grid Mingguan (Senin-Jumat vs Jam 1-10) berdasarkan Kelas yang dipilih
 */
function renderGridJadwal() {
    const idKelas = document.getElementById('grid-select-kelas').value;
    const tbody = document.getElementById('tbody-grid-jadwal');
    if (!tbody) return;

    if (!idKelas) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-muted py-4">Silakan pilih kelas di atas terlebih dahulu untuk menampilkan grid jadwal.</td>
            </tr>
        `;
        return;
    }

    const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const maxJam = 10; // 10 Jam Pelajaran per Hari

    // Ambil data jadwal yang sudah ada untuk kelas ini (jika pernah diinput sebelumnya)
    const existingJadwal = {};
    (localData.Jadwal || []).forEach(j => {
        if (String(j.id_kelas) === String(idKelas)) {
            existingJadwal[`${j.hari}_${j.jam_ke}`] = j;
        }
    });

    // Opsi Mapel & Guru
    const mapelOptionsHTML = (localData.Mapel || [])
        .map(m => `<option value="${m.id_mapel}">${m.nama_mapel}</option>`).join('');
    
    const guruOptionsHTML = (localData.Guru || [])
        .map(g => `<option value="${g.id_guru}">${g.nama_lengkap}</option>`).join('');

    let rowsHTML = '';

    for (let jam = 1; jam <= maxJam; jam++) {
        rowsHTML += `<tr>`;
        rowsHTML += `<td class="fw-bold bg-light align-middle">Jam ${jam}</td>`;

        hariList.forEach(hari => {
            rowsHTML += `
                <td class="p-1">
                    <!-- Dropdown Mapel: Biru Muda -->
                    <select class="form-select form-select-sm mb-1 grid-mapel-select" data-hari="${hari}" data-jam="${jam}" 
                            style="font-size: 0.78rem; background-color: #e7f1ff; border-color: #9ec5fe; color: #084298; font-weight: 600;" 
                            title="Pilih Mata Pelajaran">
                        <option value="">-- Select Mapel --</option>
                        ${mapelOptionsHTML}
                    </select>

                    <!-- Dropdown Guru: Hijau Muda -->
                    <select class="form-select form-select-sm grid-guru-select" data-hari="${hari}" data-jam="${jam}" 
                            style="font-size: 0.78rem; background-color: #e8f5e9; border-color: #a5d6a7; color: #0f5132; font-weight: 600;" 
                            title="Pilih Guru Pengajar">
                        <option value="">-- Select Guru --</option>
                        ${guruOptionsHTML}
                    </select>
                </td>
            `;
        });

        rowsHTML += `</tr>`;
    }

    tbody.innerHTML = rowsHTML;

    // Pre-select data terisi jika ada jadwal eksis
    for (let jam = 1; jam <= maxJam; jam++) {
        hariList.forEach(hari => {
            const key = `${hari}_${jam}`;
            const existingData = existingJadwal[key];
            if (existingData) {
                const mapelSel = tbody.querySelector(`.grid-mapel-select[data-hari="${hari}"][data-jam="${jam}"]`);
                const guruSel = tbody.querySelector(`.grid-guru-select[data-hari="${hari}"][data-jam="${jam}"]`);
                if (mapelSel && existingData.id_mapel) mapelSel.value = existingData.id_mapel;
                if (guruSel && existingData.id_guru) guruSel.value = existingData.id_guru;
            }
        });
    }
}

/**
 * Mengumpulkan semua data dari Grid Matriks dan mengirimkannya secara Batch/Massal ke Google Sheets Backend
 * Mempertahankan id_jadwal jika slot tersebut sudah ada sebelumnya.
 */
async function simpanBatchJadwal() {
    const idKelas = document.getElementById('grid-select-kelas').value;
    const tahunAjaran = document.getElementById('grid-tahun-ajaran').value;
    const semester = document.getElementById('grid-semester').value;

    if (!idKelas) {
        return Swal.fire('Peringatan', 'Silakan pilih kelas terlebih dahulu!', 'warning');
    }

    // Mapping jadwal eksis untuk mempertahankan id_jadwal lama
    const existingJadwal = {};
    (localData.Jadwal || []).forEach(j => {
        if (String(j.id_kelas) === String(idKelas)) {
            existingJadwal[`${j.hari}_${j.jam_ke}`] = j;
        }
    });

    const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const maxJam = 10;
    const batchData = [];

    hariList.forEach(hari => {
        for (let jam = 1; jam <= maxJam; jam++) {
            const mapelSel = document.querySelector(`.grid-mapel-select[data-hari="${hari}"][data-jam="${jam}"]`);
            const guruSel = document.querySelector(`.grid-guru-select[data-hari="${hari}"][data-jam="${jam}"]`);

            const idMapel = mapelSel ? mapelSel.value : '';
            const idGuru = guruSel ? guruSel.value : '';

            // Hanya proses slot yang dipilih mata pelajarannya
            if (idMapel) {
                const existing = existingJadwal[`${hari}_${jam}`];
                
                batchData.push({
                    id_jadwal: existing ? (existing.id_jadwal || existing['ID Jadwal'] || '') : '', // Tetapkan ID lama jika ada
                    hari: hari,
                    jam_ke: jam,
                    id_kelas: idKelas,
                    id_mapel: idMapel,
                    id_guru: idGuru,
                    tahun_ajaran: tahunAjaran,
                    semester: semester
                });
            }
        }
    });

    if (batchData.length === 0) {
        return Swal.fire('Peringatan', 'Belum ada mata pelajaran yang dipilih pada grid jadwal.', 'warning');
    }

    // Tampilkan Loading
    Swal.fire({
        title: 'Menyimpan Jadwal Kelas...',
        text: `Memproses ${batchData.length} slot jam pelajaran sekaligus.`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'batchSaveJadwal',
                table: 'Jadwal',
                id_kelas: idKelas,
                tahun_ajaran: tahunAjaran,
                semester: semester,
                data: batchData
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            Swal.fire('Berhasil!', result.message || `Jadwal kelas berhasil disimpan (${batchData.length} slot tersimpan).`, 'success');
            
            // Tutup modal
            const modalEl = document.getElementById('modalGridJadwal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            // Refresh data utama
            if (typeof loadAllMasterData === 'function') {
                loadAllMasterData();
            }
        } else {
            throw new Error(result.message || 'Gagal menyimpan data jadwal.');
        }
    } catch (err) {
        console.error('Error simpanBatchJadwal:', err);
        Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data: ' + err.message, 'error');
    }
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
