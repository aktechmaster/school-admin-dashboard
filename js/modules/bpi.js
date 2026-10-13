// ==========================================
// MODUL MASTER HALAQOH BPI (LINTAS KELAS)
// ==========================================

function renderBPITable() {
    const tbody = document.querySelector('#table-halaqoh_bpi tbody');
    if (!tbody) return;

    const kelasOptions = (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: k.nama_kelas }));

    renderTableControls('Halaqoh_BPI', [
        { field: 'id_kelas', label: 'Kelas', options: kelasOptions },
        { field: 'semester', label: 'Semester', options: ['Ganjil', 'Genap'] }
    ], renderBPITable);

    const info = getFilteredAndPaginatedData('Halaqoh_BPI');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data Master Halaqoh BPI tidak ditemukan.</td></tr>`;
        renderPaginationControls('Halaqoh_BPI', info, renderBPITable);
        return;
    }

    const mapKelas = {};
    (localData.Kelas || []).forEach(k => { mapKelas[k.id_kelas] = k.nama_kelas; });

    const mapGuru = {};
    (localData.Guru || []).forEach(g => { mapGuru[g.id_guru] = g.nama_lengkap; });

    const mapSiswa = {};
    (localData.Siswa || []).forEach(s => { mapSiswa[s.id_siswa] = s.nama_siswa; });

    tbody.innerHTML = info.data.map(row => {
        const kelasDisplay = mapKelas[row.id_kelas] || row.id_kelas || '-';
        const guruDisplay = mapGuru[row.id_guru] || row.id_guru || '-';
        const siswaDisplay = mapSiswa[row.id_siswa] || row.id_siswa || '-';

        return `
            <tr>
                <td><b>${row.id_halaqoh || ''}</b></td>
                <td>${kelasDisplay}</td>
                <td><span class="badge bg-primary">${row.nama_halaqoh || 'Halaqoh BPI'}</span></td>
                <td>${guruDisplay}</td>
                <td>${siswaDisplay}</td>
                <td>${row.tahun_ajaran || '-'}</td>
                <td>Semester ${row.semester || '-'}</td>
                <td>${renderActionButtons('Halaqoh_BPI', row.id_halaqoh)}</td>
            </tr>
        `;
    }).join('');

    renderPaginationControls('Halaqoh_BPI', info, renderBPITable);
}

/**
 * Membuka Modal Input Massal BPI Lintas Kelas
 */
function openModalMassalBPI() {
    const modalDialog = document.querySelector('#modalMassalBPI .modal-dialog');
    if (modalDialog) {
        modalDialog.style.position = '';
        modalDialog.style.left = '';
        modalDialog.style.top = '';
        modalDialog.style.margin = '';
    }

    const selectGuru = document.getElementById('massal-bpi-guru');
    if (selectGuru) {
        selectGuru.innerHTML = '<option value="">-- Pilih Pembina BPI --</option>' +
            (localData.Guru || []).map(g => `<option value="${g.id_guru}">${g.nama_lengkap} (${g.id_guru})</option>`).join('');
    }

    document.getElementById('massal-bpi-tingkat').value = '';
    document.getElementById('wrapper-input-bpi').classList.add('d-none');

    if (typeof makeModalDraggable === 'function') {
        makeModalDraggable('modalMassalBPI');
    }

    const modalEl = document.getElementById('modalMassalBPI');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * Render Tabel Checklist Siswa Lintas Kelas untuk BPI
 */
function renderFormMassalBPI() {
    const tingkat = document.getElementById('massal-bpi-tingkat').value;
    const idGuru = document.getElementById('massal-bpi-guru').value;
    const tahunAjaran = document.getElementById('massal-bpi-ta').value;
    const semester = document.getElementById('massal-bpi-semester').value;
    const wrapper = document.getElementById('wrapper-input-bpi');
    const tbody = document.getElementById('tbody-siswa-bpi');

    if (!tingkat || !idGuru) {
        wrapper.classList.add('d-none');
        return;
    }

    wrapper.classList.remove('d-none');

    // Set Default Nama Halaqoh
    const guruObj = (localData.Guru || []).find(g => String(g.id_guru) === String(idGuru));
    const namaGuru = guruObj ? guruObj.nama_lengkap : 'Pembina';
    document.getElementById('massal-bpi-nama-halaqoh').value = `Halaqoh BPI ${namaGuru} - Tingkat ${tingkat}`;

    // 1. Cari semua ID Kelas yang berada pada Tingkat tersebut
    const kelasTingkat = (localData.Kelas || []).filter(k => String(k.tingkat) === String(tingkat));
    const idKelasMap = {};
    const namaKelasMap = {};
    kelasTingkat.forEach(k => {
        idKelasMap[k.id_kelas] = true;
        namaKelasMap[k.id_kelas] = k.nama_kelas;
    });

    // 2. Filter Siswa pada Tingkat tersebut
    const siswaTingkat = (localData.Siswa || []).filter(s => idKelasMap[s.id_kelas]);

    if (siswaTingkat.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Tidak ada siswa terdaftar pada Tingkat ${tingkat}.</td></tr>`;
        updateCounterSiswaSelectedBPI();
        return;
    }

    // 3. Mapping data Halaqoh BPI eksis
    const mapHalaqohSiswa = {};
    const mapGuruSiswa = {};
    (localData.Halaqoh_BPI || []).forEach(h => {
        if (String(h.tahun_ajaran) === String(tahunAjaran) && String(h.semester) === String(semester)) {
            mapHalaqohSiswa[h.id_siswa] = h;
            const g = (localData.Guru || []).find(guru => String(guru.id_guru) === String(h.id_guru));
            mapGuruSiswa[h.id_siswa] = g ? g.nama_lengkap : h.id_guru;
        }
    });

    // 4. Render Baris Siswa
    tbody.innerHTML = siswaTingkat.map((s, idx) => {
        const halaqohEksis = mapHalaqohSiswa[s.id_siswa];
        const isCurrentGuru = halaqohEksis && String(halaqohEksis.id_guru) === String(idGuru);
        const isOtherGuru = halaqohEksis && String(halaqohEksis.id_guru) !== String(idGuru);

        let statusBadge = `<span class="badge bg-light text-muted border"><i class="fas fa-minus-circle me-1"></i>Belum Ada Halaqoh BPI</span>`;
        if (isCurrentGuru) {
            statusBadge = `<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Halaqoh Ini</span>`;
        } else if (isOtherGuru) {
            const namaGuruLain = mapGuruSiswa[s.id_siswa] || 'Pembina Lain';
            statusBadge = `<span class="badge bg-warning text-dark"><i class="fas fa-user-tag me-1"></i>Halaqoh BPI ${namaGuruLain}</span>`;
        }

        const isChecked = isCurrentGuru ? 'checked' : '';
        // KUNCI CHECKBOX jika siswa sudah terdaftar di pembina BPI lain
        const isDisabled = isOtherGuru ? 'disabled' : '';

        return `
            <tr class="row-siswa-bpi ${isOtherGuru ? 'bg-light' : ''}">
                <td class="text-center small">${idx + 1}</td>
                <td>
                    <div class="form-check">
                        <input class="form-check-input chk-siswa-massal-bpi" type="checkbox" value="${s.id_siswa}" data-id-kelas="${s.id_kelas}" id="chk_bpi_${s.id_siswa}" ${isChecked} ${isDisabled} onchange="updateCounterSiswaSelectedBPI()">
                    </div>
                </td>
                <td>
                    <label class="form-check-label fw-bold cursor-pointer small mb-0 ${isOtherGuru ? 'text-muted' : ''}" for="chk_bpi_${s.id_siswa}">
                        ${s.nama_siswa}
                    </label>
                    <div class="small text-muted" style="font-size: 0.75rem;">ID: ${s.id_siswa}</div>
                </td>
                <td><span class="badge bg-info text-dark">${namaKelasMap[s.id_kelas] || s.id_kelas}</span></td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');

    updateCounterSiswaSelectedBPI();
}

function filterListSiswaBPI() {
    const q = document.getElementById('search-siswa-bpi').value.toLowerCase();
    const rows = document.querySelectorAll('#tbody-siswa-bpi tr.row-siswa-bpi');

    rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

function updateCounterSiswaSelectedBPI() {
    const count = document.querySelectorAll('.chk-siswa-massal-bpi:checked').length;
    const badge = document.getElementById('badge-total-terpilih-bpi');
    if (badge) {
        badge.innerText = `${count} Siswa Terpilih`;
        if (count >= 10 && count <= 15) {
            badge.className = 'badge bg-success fs-6';
        } else if (count > 15) {
            badge.className = 'badge bg-warning text-dark fs-6';
        } else {
            badge.className = 'badge bg-primary fs-6';
        }
    }
}

/**
 * Simpan Batch Massal Halaqoh BPI
 */
async function simpanBatchMassalBPI() {
    const tingkat = document.getElementById('massal-bpi-tingkat').value;
    const idGuru = document.getElementById('massal-bpi-guru').value;
    const namaHalaqoh = document.getElementById('massal-bpi-nama-halaqoh').value.trim();
    const tahunAjaran = document.getElementById('massal-bpi-ta').value;
    const semester = document.getElementById('massal-bpi-semester').value;

    if (!tingkat || !idGuru || !namaHalaqoh) {
        return Swal.fire('Peringatan', 'Harap lengkapi Tingkat, Pembina, dan Nama Halaqoh BPI!', 'warning');
    }

    const selectedChks = document.querySelectorAll('.chk-siswa-massal-bpi:checked');
    if (selectedChks.length === 0) {
        return Swal.fire('Peringatan', 'Pilih minimal 1 siswa untuk dimasukkan ke dalam Halaqoh BPI ini!', 'warning');
    }

    // Ambil semua ID Kelas yang terdaftar di Tingkat ini
    const idKelasList = (localData.Kelas || [])
        .filter(k => String(k.tingkat) === String(tingkat))
        .map(k => String(k.id_kelas));

    const batchPayload = [];
    selectedChks.forEach(chk => {
        batchPayload.push({
            id_halaqoh: '',
            nama_halaqoh: namaHalaqoh,
            id_kelas: chk.getAttribute('data-id-kelas') || '',
            id_guru: idGuru,
            id_siswa: chk.value,
            tahun_ajaran: tahunAjaran,
            semester: semester
        });
    });

    Swal.fire({
        title: 'Menyimpan Master Halaqoh BPI...',
        text: `Memproses ${batchPayload.length} siswa ke dalam ${namaHalaqoh}.`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'batchSaveHalaqohBPI',
                table: 'Halaqoh_BPI',
                tingkat: tingkat,
                id_guru: idGuru,
                tahun_ajaran: tahunAjaran,
                semester: semester,
                id_kelas_list: idKelasList, // <--- Dikirim ke backend
                data: batchPayload
            })
        });

        const res = await response.json();

        if (res.status === 'success') {
            Swal.fire('Berhasil!', res.message || `Data Halaqoh BPI berhasil disimpan.`, 'success');

            const modalEl = document.getElementById('modalMassalBPI');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            if (typeof loadAllMasterData === 'function') {
                loadAllMasterData();
            }
        } else {
            throw new Error(res.message || 'Gagal menyimpan data Halaqoh BPI.');
        }
    } catch (err) {
        console.error('Error simpanBatchMassalBPI:', err);
        Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data: ' + err.message, 'error');
    }
}
