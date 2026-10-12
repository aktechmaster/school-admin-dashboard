// ==========================================
// MODUL MASTER HALAQOH T2Q (LINTAS KELAS)
// ==========================================

function renderT2QTable() {
    const tbody = document.querySelector('#table-halaqoh_t2q tbody');
    if (!tbody) return;

    const kelasOptions = (localData.Kelas || []).map(k => ({ value: k.id_kelas, label: k.nama_kelas }));

    renderTableControls('Halaqoh_T2Q', [
        { field: 'id_kelas', label: 'Kelas', options: kelasOptions },
        { field: 'semester', label: 'Semester', options: ['Ganjil', 'Genap'] }
    ], renderT2QTable);

    const info = getFilteredAndPaginatedData('Halaqoh_T2Q');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data Master Halaqoh T2Q tidak ditemukan.</td></tr>`;
        renderPaginationControls('Halaqoh_T2Q', info, renderT2QTable);
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
                <td><span class="badge bg-success">${row.nama_halaqoh || 'Halaqoh T2Q'}</span></td>
                <td>${guruDisplay}</td>
                <td>${siswaDisplay}</td>
                <td>${row.tahun_ajaran || '-'}</td>
                <td>Semester ${row.semester || '-'}</td>
                <td>${renderActionButtons('Halaqoh_T2Q', row.id_halaqoh)}</td>
            </tr>
        `;
    }).join('');

    renderPaginationControls('Halaqoh_T2Q', info, renderT2QTable);
}

/**
 * Membuka Modal Input Massal Lintas Kelas
 */
function openModalMassalT2Q() {
    const modalDialog = document.querySelector('#modalMassalT2Q .modal-dialog');
    if (modalDialog) {
        modalDialog.style.position = '';
        modalDialog.style.left = '';
        modalDialog.style.top = '';
        modalDialog.style.margin = '';
    }

    const selectGuru = document.getElementById('massal-t2q-guru');
    if (selectGuru) {
        selectGuru.innerHTML = '<option value="">-- Pilih Pengajar T2Q --</option>' +
            (localData.Guru || []).map(g => `<option value="${g.id_guru}">${g.nama_lengkap} (${g.id_guru})</option>`).join('');
    }

    document.getElementById('massal-t2q-tingkat').value = '';
    document.getElementById('wrapper-input-t2q').classList.add('d-none');

    if (typeof makeModalDraggable === 'function') {
        makeModalDraggable('modalMassalT2Q');
    }

    const modalEl = document.getElementById('modalMassalT2Q');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * Render Tabel Checklist Siswa Lintas Kelas berdasarkan Tingkat
 */
function renderFormMassalT2Q() {
    const tingkat = document.getElementById('massal-t2q-tingkat').value;
    const idGuru = document.getElementById('massal-t2q-guru').value;
    const tahunAjaran = document.getElementById('massal-t2q-ta').value;
    const semester = document.getElementById('massal-t2q-semester').value;
    const wrapper = document.getElementById('wrapper-input-t2q');
    const tbody = document.getElementById('tbody-siswa-t2q');

    if (!tingkat || !idGuru) {
        wrapper.classList.add('d-none');
        return;
    }

    wrapper.classList.remove('d-none');

    // Set Default Nama Halaqoh
    const guruObj = (localData.Guru || []).find(g => String(g.id_guru) === String(idGuru));
    const namaGuru = guruObj ? guruObj.nama_lengkap : 'Pengajar';
    document.getElementById('massal-t2q-nama-halaqoh').value = `Halaqoh ${namaGuru} - Tingkat ${tingkat}`;

    // 1. Cari semua ID Kelas yang berada pada Tingkat tersebut
    const kelasTingkat = (localData.Kelas || []).filter(k => String(k.tingkat) === String(tingkat));
    const idKelasMap = {};
    const namaKelasMap = {};
    kelasTingkat.forEach(k => {
        idKelasMap[k.id_kelas] = true;
        namaKelasMap[k.id_kelas] = k.nama_kelas;
    });

    // 2. Filter Siswa yang berada di kelas-kelas tingkat tersebut
    const siswaTingkat = (localData.Siswa || []).filter(s => idKelasMap[s.id_kelas]);

    if (siswaTingkat.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Tidak ada siswa terdaftar pada Tingkat ${tingkat}.</td></tr>`;
        updateCounterSiswaSelected();
        return;
    }

    // 3. Mapping data Halaqoh T2Q eksis untuk mengecek status siswa saat ini
    const mapHalaqohSiswa = {};
    const mapGuruSiswa = {};
    (localData.Halaqoh_T2Q || []).forEach(h => {
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

        let statusBadge = `<span class="badge bg-light text-muted border"><i class="fas fa-minus-circle me-1"></i>Belum Ada Halaqoh</span>`;
        if (isCurrentGuru) {
            statusBadge = `<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Halaqoh Ini</span>`;
        } else if (isOtherGuru) {
            const namaGuruLain = mapGuruSiswa[s.id_siswa] || 'Guru Lain';
            statusBadge = `<span class="badge bg-warning text-dark"><i class="fas fa-user-tag me-1"></i>Halaqoh ${namaGuruLain}</span>`;
        }

        const isChecked = isCurrentGuru ? 'checked' : '';

        return `
            <tr class="row-siswa-t2q">
                <td class="text-center small">${idx + 1}</td>
                <td>
                    <div class="form-check">
                        <input class="form-check-input chk-siswa-massal" type="checkbox" value="${s.id_siswa}" data-id-kelas="${s.id_kelas}" id="chk_s_${s.id_siswa}" ${isChecked} onchange="updateCounterSiswaSelected()">
                    </div>
                </td>
                <td>
                    <label class="form-check-label fw-bold cursor-pointer small mb-0" for="chk_s_${s.id_siswa}">
                        ${s.nama_siswa}
                    </label>
                    <div class="small text-muted" style="font-size: 0.75rem;">ID: ${s.id_siswa}</div>
                </td>
                <td><span class="badge bg-info text-dark">${namaKelasMap[s.id_kelas] || s.id_kelas}</span></td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');

    updateCounterSiswaSelected();
}

function filterListSiswaT2Q() {
    const q = document.getElementById('search-siswa-t2q').value.toLowerCase();
    const rows = document.querySelectorAll('#tbody-siswa-t2q tr.row-siswa-t2q');

    rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

function updateCounterSiswaSelected() {
    const count = document.querySelectorAll('.chk-siswa-massal:checked').length;
    const badge = document.getElementById('badge-total-terpilih-t2q');
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
 * Simpan Batch Massal Halaqoh T2Q
 */
async function simpanBatchMassalT2Q() {
    const tingkat = document.getElementById('massal-t2q-tingkat').value;
    const idGuru = document.getElementById('massal-t2q-guru').value;
    const namaHalaqoh = document.getElementById('massal-t2q-nama-halaqoh').value.trim();
    const tahunAjaran = document.getElementById('massal-t2q-ta').value;
    const semester = document.getElementById('massal-t2q-semester').value;

    if (!tingkat || !idGuru || !namaHalaqoh) {
        return Swal.fire('Peringatan', 'Harap lengkapi Tingkat, Pengajar, dan Nama Halaqoh!', 'warning');
    }

    const selectedChks = document.querySelectorAll('.chk-siswa-massal:checked');
    if (selectedChks.length === 0) {
        return Swal.fire('Peringatan', 'Pilih minimal 1 siswa untuk dimasukkan ke dalam Halaqoh ini!', 'warning');
    }

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
        title: 'Menyimpan Master Halaqoh T2Q...',
        text: `Memproses ${batchPayload.length} siswa ke dalam ${namaHalaqoh}.`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'batchSaveHalaqohT2Q',
                table: 'Halaqoh_T2Q',
                tingkat: tingkat,
                id_guru: idGuru,
                tahun_ajaran: tahunAjaran,
                semester: semester,
                data: batchPayload
            })
        });

        const res = await response.json();

        if (res.status === 'success') {
            Swal.fire('Berhasil!', res.message || `Data Halaqoh T2Q berhasil disimpan.`, 'success');

            const modalEl = document.getElementById('modalMassalT2Q');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            if (typeof loadAllMasterData === 'function') {
                loadAllMasterData();
            }
        } else {
            throw new Error(res.message || 'Gagal menyimpan data Halaqoh T2Q.');
        }
    } catch (err) {
        console.error('Error simpanBatchMassalT2Q:', err);
        Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data: ' + err.message, 'error');
    }
}
