// ==========================================
// MODUL INPUT HARI EFEKTIF
// ==========================================

const NAMA_HARI_IND = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN_IND = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function renderHariEfektifTable() {
    const monthInput = document.getElementById('filter-bulan-efektif');
    if (!monthInput) return;

    // Default bulan berjalan jika belum dipilih
    if (!monthInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        monthInput.value = `${yyyy}-${mm}`;
    }

    const [yearStr, monthStr] = monthInput.value.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-index

    const totalDays = new Date(year, month + 1, 0).getDate();
    const tbody = document.getElementById('tbody-hari-efektif');
    if (!tbody) return;

    // Petakan data lokal Hari_Efektif jika sudah pernah disimpan di DB_Administrasi
    const existingMap = {};
    (localData.Hari_Efektif || []).forEach(item => {
        if (item.tanggal) {
            existingMap[item.tanggal] = item;
        }
    });

    let rowsHtml = '';
    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeekIndex = dateObj.getDay();
        const dayName = NAMA_HARI_IND[dayOfWeekIndex];
        
        const yyyy = year;
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateIso = `${yyyy}-${mm}-${dd}`; // 2026-07-01
        const dateLabel = `${day} ${NAMA_BULAN_IND[month]} ${year}`; // 1 Juli 2026

        // Cek nilai dari database lokal atau tetapkan default (Sabtu/Minggu = 0, Senin-Jumat = 1)
        let savedStatus = existingMap[dateIso] ? existingMap[dateIso].status : null;
        if (savedStatus === null || savedStatus === undefined || savedStatus === '') {
            savedStatus = (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) ? 0 : 1;
        } else {
            savedStatus = Number(savedStatus);
        }

        const isWeekend = (dayOfWeekIndex === 0 || dayOfWeekIndex === 6);
        const bgRow = isWeekend ? 'table-warning' : '';

        rowsHtml += `
            <tr class="${bgRow}" data-date="${dateIso}" data-date-label="${dateLabel}">
                <td>${day}</td>
                <td><b>${dateIso}</b></td>
                <td><span class="badge ${isWeekend ? 'bg-danger' : 'bg-secondary'}">${dayName}</span></td>
                <td>
                    <select class="form-select form-select-sm text-center fw-bold status-efektif-select" onchange="updateRowKeterangan(this)">
                        <option value="1" ${Number(savedStatus) === 1 ? 'selected' : ''}>1 (Efektif)</option>
                        <option value="0" ${Number(savedStatus) === 0 ? 'selected' : ''}>0 (Tidak Efektif)</option>
                    </select>
                </td>
                <td class="ket-text text-start">
                    ${Number(savedStatus) === 1 ? '<span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>Hari Efektif KBM</span>' : '<span class="text-muted"><i class="fas fa-times-circle me-1"></i>Libur / Tidak Efektif</span>'}
                </td>
            </tr>
        `;
    }

    tbody.innerHTML = rowsHtml;
}

function updateRowKeterangan(selectEl) {
    const tr = selectEl.closest('tr');
    const ketTd = tr.querySelector('.ket-text');
    if (selectEl.value === '1') {
        ketTd.innerHTML = '<span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>Hari Efektif KBM</span>';
    } else {
        ketTd.innerHTML = '<span class="text-muted"><i class="fas fa-times-circle me-1"></i>Libur / Tidak Efektif</span>';
    }
}

function setPresetHariEfektif(type) {
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
    const monthInput = document.getElementById('filter-bulan-efektif');
    if (!monthInput || !monthInput.value) {
        return Swal.fire('Peringatan', 'Silakan pilih bulan terlebih dahulu.', 'warning');
    }

    const bulanTahun = monthInput.value; // Contoh: "2026-07"
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
