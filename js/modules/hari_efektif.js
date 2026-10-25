// ==========================================
// MODUL INPUT HARI EFEKTIF
// ==========================================

const NAMA_HARI_IND = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN_IND = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Menyesuaikan daftar 12 bulan sesuai Tahun Pelajaran terpilih (Juli N s.d. Juni N+1)
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

    // Set default ke bulan berjalan jika cocok, atau ke Juli (bulan pertama TP)
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

    // Jika dropdown bulan belum terisi, inisialisasi terlebih dahulu
    if (!monthSelect.options || monthSelect.options.length === 0) {
        updateDropdownBulanEfektif();
        return;
    }

    const [yearStr, monthStr] = monthSelect.value.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const tbody = document.getElementById('tbody-hari-efektif');
    if (!tbody) return;

    // Normalisasi pencocokan tanggal dari localData
    const existingMap = {};
    (localData.Hari_Efektif || []).forEach(item => {
        let tgl = item.tanggal;
        if (tgl) {
            tgl = String(tgl).trim();
            if (tgl.includes('T')) {
                tgl = tgl.split('T')[0];
            }
            existingMap[tgl] = item;
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
        const dateIso = `${yyyy}-${mm}-${dd}`;
        const dateLabel = `${day} ${NAMA_BULAN_IND[month]} ${year}`;

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
