// ==========================================
// MODUL MASTER HALAQOH T2Q
// ==========================================

let massalT2QCounter = 0;

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

function openModalMassalT2Q() {
    const modalDialog = document.querySelector('#modalMassalT2Q .modal-dialog');
    if (modalDialog) {
        modalDialog.style.position = '';
        modalDialog.style.left = '';
        modalDialog.style.top = '';
        modalDialog.style.margin = '';
    }

    const selectKelas = document.getElementById('massal-t2q-kelas');
    if (!selectKelas) return;

    selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
        (localData.Kelas || []).map(k => `<option value="${k.id_kelas}">${k.nama_kelas}</option>`).join('');

    document.getElementById('container-kelompok-t2q').innerHTML = `
        <div class="text-center text-muted py-4">Silakan pilih kelas terlebih dahulu untuk mulai mengalokasikan siswa ke kelompok Halaqoh T2Q.</div>
    `;
    document.getElementById('btn-tambah-kelompok-t2q').style.display = 'none';

    if (typeof makeModalDraggable === 'function') {
        makeModalDraggable('modalMassalT2Q');
    }

    const modalEl = document.getElementById('modalMassalT2Q');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function renderFormMassalT2Q() {
    const idKelas = document.getElementById('massal-t2q-kelas').value;
    const container = document.getElementById('container-kelompok-t2q');
    const btnTambah = document.getElementById('btn-tambah-kelompok-t2q');

    if (!idKelas) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">Silakan pilih kelas terlebih dahulu untuk mulai mengalokasikan siswa ke kelompok Halaqoh T2Q.</div>
        `;
        btnTambah.style.display = 'none';
        return;
    }

    container.innerHTML = '';
    massalT2QCounter = 0;
    btnTambah.style.display = 'block';

    // Buat kelompok Halaqoh pertama secara otomatis
    tambahKelompokT2Q();
}

function tambahKelompokT2Q() {
    massalT2QCounter++;
    const idKelas = document.getElementById('massal-t2q-kelas').value;
    const container = document.getElementById('container-kelompok-t2q');

    // Ambil daftar siswa yang berada di kelas pilihan ini
    const siswaKelas = (localData.Siswa || []).filter(s => String(s.id_kelas) === String(idKelas));

    // Pilihan Pengajar T2Q (Semua Guru)
    const guruOptions = (localData.Guru || [])
        .map(g => `<option value="${g.id_guru}">${g.nama_lengkap} (${g.id_guru})</option>`).join('');

    let checklistSiswaHTML = '';
    if (siswaKelas.length === 0) {
        checklistSiswaHTML = `<div class="text-danger small p-2">Tidak ada siswa yang terdaftar pada kelas ini di Master Siswa.</div>`;
    } else {
        checklistSiswaHTML = `<div class="row g-2 p-2 border rounded bg-white max-h-250 overflow-auto" style="max-height: 220px;">`;
        siswaKelas.forEach((s, idx) => {
            checklistSiswaHTML += `
                <div class="col-md-6 col-12">
                    <div class="form-check py-1 border-bottom">
                        <input class="form-check-input chk-siswa-t2q-${massalT2QCounter}" type="checkbox" value="${s.id_siswa}" id="chk_t2q_${massalT2QCounter}_${s.id_siswa}" onchange="updateCounterSiswaT2Q(${massalT2QCounter})">
                        <label class="form-check-label small cursor-pointer" for="chk_t2q_${massalT2QCounter}_${s.id_siswa}">
                            <b>${idx + 1}.</b> ${s.nama_siswa} <span class="text-muted">(${s.id_siswa})</span>
                        </label>
                    </div>
                </div>
            `;
        });
        checklistSiswaHTML += `</div>`;
    }

    const cardHTML = `
        <div class="card mb-3 border shadow-sm card-kelompok-t2q" id="card-kelompok-t2q-${massalT2QCounter}" data-group-id="${massalT2QCounter}">
            <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                <span class="fw-bold text-success"><i class="fas fa-users-class me-1"></i> Kelompok Halaqoh #${massalT2QCounter}</span>
                <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2" onclick="hapusKelompokT2Q(${massalT2QCounter})" title="Hapus Kelompok Ini">
                    <i class="fas fa-times me-1"></i> Hapus Kelompok
                </button>
            </div>
            <div class="card-body p-3">
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold small">Nama Kelompok Halaqoh <span class="text-danger">*</span></label>
                        <input type="text" class="form-control form-control-sm input-nama-halaqoh" value="Halaqoh T2Q ${massalT2QCounter}" placeholder="Contoh: Halaqoh 1 / Halaqoh Al-Fatihah">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold small">2. Pilih Pengajar T2Q <span class="text-danger">*</span></label>
                        <select class="form-select form-select-sm select-pengajar-t2q">
                            <option value="">-- Pilih Pengajar T2Q --</option>
                            ${guruOptions}
                        </select>
                    </div>
                </div>

                <div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <label class="form-label fw-bold small mb-0">3. Pilih Siswa (1 Halaqoh Idealnya 10-15 Siswa) <span class="text-danger">*</span></label>
                        <span class="badge bg-info text-dark" id="badge-count-t2q-${massalT2QCounter}">0 Siswa Terpilih</span>
                    </div>
                    ${checklistSiswaHTML}
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', cardHTML);
}

function hapusKelompokT2Q(groupId) {
    const el = document.getElementById(`card-kelompok-t2q-${groupId}`);
    if (el) el.remove();
}

function updateCounterSiswaT2Q(groupId) {
    const checked = document.querySelectorAll(`.chk-siswa-t2q-${groupId}:checked`).length;
    const badge = document.getElementById(`badge-count-t2q-${groupId}`);
    if (badge) {
        badge.innerText = `${checked} Siswa Terpilih`;
        if (checked >= 10 && checked <= 15) {
            badge.className = 'badge bg-success';
        } else if (checked > 15) {
            badge.className = 'badge bg-warning text-dark';
        } else {
            badge.className = 'badge bg-info text-dark';
        }
    }
}

async function simpanBatchMassalT2Q() {
    const idKelas = document.getElementById('massal-t2q-kelas').value;
    const tahunAjaran = document.getElementById('massal-t2q-ta').value;
    const semester = document.getElementById('massal-t2q-semester').value;

    if (!idKelas) {
        return Swal.fire('Peringatan', 'Silakan pilih kelas terlebih dahulu!', 'warning');
    }

    const cards = document.querySelectorAll('.card-kelompok-t2q');
    if (cards.length === 0) {
        return Swal.fire('Peringatan', 'Belum ada kelompok Halaqoh T2Q yang dibuat.', 'warning');
    }

    const batchPayload = [];

    for (let card of cards) {
        const groupId = card.getAttribute('data-group-id');
        const namaHalaqoh = card.querySelector('.input-nama-halaqoh').value.trim() || `Halaqoh T2Q ${groupId}`;
        const idGuru = card.querySelector('.select-pengajar-t2q').value;
        const checkedSiswaEls = card.querySelectorAll(`.chk-siswa-t2q-${groupId}:checked`);

        if (!idGuru) {
            return Swal.fire('Peringatan', `Pengajar T2Q pada '${namaHalaqoh}' belum dipilih!`, 'warning');
        }

        if (checkedSiswaEls.length === 0) {
            return Swal.fire('Peringatan', `Pilih minimal 1 siswa pada '${namaHalaqoh}'!`, 'warning');
        }

        checkedSiswaEls.forEach(chk => {
            batchPayload.push({
                id_halaqoh: '',
                nama_halaqoh: namaHalaqoh,
                id_kelas: idKelas,
                id_guru: idGuru,
                id_siswa: chk.value,
                tahun_ajaran: tahunAjaran,
                semester: semester
            });
        });
    }

    Swal.fire({
        title: 'Menyimpan Master Halaqoh T2Q...',
        text: `Memproses ${batchPayload.length} alokasi siswa ke kelompok Halaqoh T2Q.`,
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
                id_kelas: idKelas,
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
