// ==========================================
// MODUL INPUT HARI EFEKTIF (HAK AKSES ADMIN & WAKUR)
// ==========================================

const NAMA_HARI_IND = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN_IND = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Helper Pengecekan Hak Akses Ketat (Hanya Admin atau Wakur)
function canManageHariEfektif() {
    if (typeof currentUser === 'undefined' || !currentUser) return false;
    
    // 1. Cek Role Utama (Admin / Wakur)
    const role = String(currentUser.role || '').trim().toLowerCase();
    if (role === 'admin' || role === 'wakur') return true;

    // 2. Cek Flag is_wakur (Tolak tegas jika nilainya "FALSE", "false", 0, "0", false, null)
    const valWakur = currentUser.is_wakur;
    const isWakurActive = (
        valWakur === true || 
        valWakur === 1 || 
        String(valWakur).trim().toUpperCase() === 'TRUE' || 
        String(valWakur).trim() === '1'
    );

    return isWakurActive;
}

function updateDropdownBulanEfektif() {
    const taSelect = document.getElementById('select-ta-efektif');
    const monthSelect = document.getElementById('filter-bulan-efektif');
    if (!taSelect || !monthSelect) return;

    const [startYearStr, endYearStr] = taSelect.value.split('/');
    const startYear = parseInt(startYearStr, 10);
    const endYear = parseInt(endYearStr, 10);

    const bulanTP = [
        { label: `Juli ${startYear}`, value: `${startYear}-07` },
        { label: `Agustus ${startYear}`, value: `${startYear}-08` },
        { label: `September ${startYear}`, value: `${startYear}-09` },
        { label: `Oktober ${startYear}`, value: `${startYear}-10` },
        { label: `November ${startYear}`, value: `${startYear}-11` },
        { label: `Desember ${startYear}`, value: `${startYear}-12` },
        { label: `Januari ${endYear}`, value: `${endYear}-01` },
        { label: `Februari ${endYear}`, value: `${endYear}-02` },
        { label: `Maret ${endYear}`, value: `${endYear}-03` },
        { label: `April ${endYear}`, value: `${endYear}-04` },
        { label: `Mei ${endYear}`, value: `${endYear}-05` },
        { label: `Juni ${endYear}`, value: `${endYear}-06` }
    ];

    const prevVal = monthSelect.value;
    monthSelect.innerHTML = bulanTP.map(b => 
        `<option value="${b.value}" ${prevVal === b.value ? 'selected' : ''}>${b.label}</option>`
    ).join('');

    if (!monthSelect.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const currentIsoMonth = `${yyyy}-${mm}`;

        const match = bulanTP.find(b => b.value === currentIsoMonth);
        monthSelect.value = match ? match.value : bulanTP[0].value;
    }

    renderHariEfektifTable();
}

function renderHariEfektifTable() {
    const monthSelect = document.getElementById('filter-bulan-efektif');
    if (!monthSelect) return;

    if (!monthSelect.options || monthSelect.options.length === 0) {
        updateDropdownBulanEfektif();
        return;
    }

    const canEdit = canManageHariEfektif();

    // Sembunyikan atau Tampilkan kontrol edit sesuai hak akses
    const btnSimpan = document.getElementById('btn-simpan-efektif');
    const wrapperPreset = document.getElementById('wrapper-preset-efektif');

    if (btnSimpan) btnSimpan.style.display = canEdit ? 'inline-block' : 'none';
    if (wrapperPreset) wrapperPreset.style.display = canEdit ? 'flex' : 'none';

    const [yearStr, monthStr] = monthSelect.value.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const tbody = document.getElementById('tbody-hari-efektif');
    if (!tbody) return;

    // Check data dari localData.Hari_Efektif
    const existingMap = {};
    let isMonthSavedInDb = false;

    (localData.Hari_Efektif || []).forEach(item => {
        let tgl = item.tanggal;
        if (tgl) {
            tgl = String(tgl).trim();
            if (tgl.includes('T')) {
                tgl = tgl.split('T')[0];
            }
            existingMap[tgl] = item;
            if (tgl.startsWith(monthSelect.value)) {
                isMonthSavedInDb = true;
            }
        }
    });

    // Update Badge Status Bulan di Atas Tabel
    const statusBulanEl = document.getElementById('status-bulan-efektif-badge');
    if (statusBulanEl) {
        if (!canEdit) {
            statusBulanEl.className = 'badge bg-secondary py-2 px-3';
            statusBulanEl.innerHTML = '<i class="fas fa-lock me-1"></i> Mode Read-Only (Hanya Admin/Wakur yang dapat mengubah)';
        } else if (isMonthSavedInDb) {
            statusBulanEl.className = 'badge bg-success py-2 px-3';
            statusBulanEl.innerHTML = '<i class="fas fa-check-circle me-1"></i> Data Bulan Ini Sudah Tersimpan di Spreadsheet';
        } else {
            statusBulanEl.className = 'badge bg-warning text-dark py-2 px-3';
            statusBulanEl.innerHTML = '<i class="fas fa-exclamation-circle me-1"></i> Data Bulan Ini Belum Disimpan di Spreadsheet';
        }
    }

    let rowsHtml = '';
    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeekIndex = dateObj.getDay();
        const dayName = NAMA_HARI_IND[dayOfWeekIndex];
        
        const yyyy = year;
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateIso = `${yyyy}-${mm}-${dd}`;
        const dateLabel = `${day} ${NAMA_BULAN_IND[month]} ${year}`;

        const isSavedInDb = !!existingMap[dateIso];
        let savedStatus = existingMap[dateIso] ? existingMap[dateIso].status : null;
        if (savedStatus === null || savedStatus === undefined || savedStatus === '') {
            savedStatus = (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) ? 0 : 1;
        } else {
            savedStatus = Number(savedStatus);
        }

        const isWeekend = (dayOfWeekIndex === 0 || dayOfWeekIndex === 6);
        const bgRow = isWeekend ? 'table-warning' : '';

        const dbBadge = isSavedInDb 
            ? '<span class="badge bg-success ms-2"><i class="fas fa-database me-1"></i>Tersimpan di Spreadsheet</span>'
            : '<span class="badge bg-secondary ms-2"><i class="fas fa-clock me-1"></i>Belum Disimpan</span>';

        const ketText = Number(savedStatus) === 1 
            ? '<span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>Hari Efektif KBM</span>' 
            : '<span class="text-muted"><i class="fas fa-times-circle me-1"></i>Libur / Tidak Efektif</span>';

        rowsHtml += `
            <tr class="${bgRow}" data-date="${dateIso}" data-date-label="${dateLabel}">
                <td>${day}</td>
                <td><b>${dateIso}</b></td>
                <td><span class="badge ${isWeekend ? 'bg-danger' : 'bg-secondary'}">${dayName}</span></td>
                <td>
                    <select class="form-select form-select-sm text-center fw-bold status-efektif-select" ${canEdit ? '' : 'disabled'} onchange="updateRowKeterangan(this)">
                        <option value="1" ${Number(savedStatus) === 1 ? 'selected' : ''}>1 (Efektif)</option>
                        <option value="0" ${Number(savedStatus) === 0 ? 'selected' : ''}>0 (Tidak Efektif)</option>
                    </select>
                </td>
                <td class="ket-text text-start">
                    ${ketText} ${dbBadge}
                </td>
            </tr>
        `;
    }

    tbody.innerHTML = rowsHtml;
}

function updateRowKeterangan(selectEl) {
    if (!canManageHariEfektif()) return;

    const tr = selectEl.closest('tr');
    const ketTd = tr.querySelector('.ket-text');
    const statusVal = selectEl.value;

    const ketText = statusVal === '1' 
        ? '<span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>Hari Efektif KBM</span>' 
        : '<span class="text-muted"><i class="fas fa-times-circle me-1"></i>Libur / Tidak Efektif</span>';

    const changeBadge = '<span class="badge bg-warning text-dark ms-2"><i class="fas fa-pen me-1"></i>Belum Disimpan (Ada Perubahan)</span>';

    ketTd.innerHTML = `${ketText} ${changeBadge}`;
}

function setPresetHariEfektif(type) {
    if (!canManageHariEfektif()) {
        return Swal.fire('Akses Ditolak', 'Hanya Admin dan Wakur yang memiliki hak akses untuk mengubah Hari Efektif.', 'warning');
    }

    const rows = document.querySelectorAll('#tbody-hari-efektif tr');
    rows.forEach(tr => {
        const dateIso = tr.getAttribute('data-date');
        if (!dateIso) return;
        const dateObj = new Date(dateIso);
        const dayIndex = dateObj.getDay();
        const selectEl = tr.querySelector('.status-efektif-select');

        if (type === 'kerja') {
            selectEl.value = (dayIndex === 0 || dayIndex === 6) ? '0' : '1';
        } else if (type === 'libur_akhir_pekan') {
            if (dayIndex === 0 || dayIndex === 6) selectEl.value = '0';
        } else if (type === 'semua_1') {
            selectEl.value = '1';
        }
        updateRowKeterangan(selectEl);
    });
}

async function simpanHariEfektif() {
    if (!canManageHariEfektif()) {
        return Swal.fire('Akses Ditolak', 'Hanya Admin dan Wakur yang memiliki hak akses untuk mengubah Hari Efektif.', 'warning');
    }

    const monthSelect = document.getElementById('filter-bulan-efektif');
    if (!monthSelect || !monthSelect.value) {
        return Swal.fire('Peringatan', 'Silakan pilih bulan terlebih dahulu.', 'warning');
    }

    const bulanTahun = monthSelect.value;
    const rows = document.querySelectorAll('#tbody-hari-efektif tr');
    const payloadData = [];

    rows.forEach(tr => {
        const tanggal = tr.getAttribute('data-date');
        const tanggalLabel = tr.getAttribute('data-date-label');
        const selectEl = tr.querySelector('.status-efektif-select');
        const statusVal = selectEl ? parseInt(selectEl.value, 10) : 0;

        if (tanggal) {
            payloadData.push({
                id_efektif: `HE-${tanggal.replace(/-/g, '')}`,
                tanggal: tanggal,
                tanggal_label: tanggalLabel,
                bulan_tahun: bulanTahun,
                status: statusVal,
                keterangan: statusVal === 1 ? 'Hari Efektif KBM' : 'Libur / Tidak Efektif'
            });
        }
    });

    Swal.fire({ title: 'Menyimpan Hari Efektif...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const payload = {
            action: 'batchSaveHariEfektif',
            bulan_tahun: bulanTahun,
            db_jurnal_id: DB_JURNAL_ID,
            data: payloadData
        };

        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        const res = await response.json();

        if (res.status === 'success') {
            Swal.fire('Berhasil!', res.message || 'Hari Efektif berhasil disimpan dan di-import!', 'success');
            if (typeof loadAllMasterData === 'function') loadAllMasterData();
        } else {
            throw new Error(res.message || 'Gagal menyimpan Hari Efektif');
        }
    } catch (err) {
        Swal.fire('Gagal Menyimpan', err.message, 'error');
    }
}
