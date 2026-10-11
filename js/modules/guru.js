// ==========================================
// MODUL MASTER GURU
// ==========================================

/**
 * Menghitung Total Jam Pelajaran (JP) Real per Guru
 * - Mandiri JP: Slot jadwal di mana id_guru == idGuru
 * - Tim JP: Slot UNIK (Hari + Jam Ke) dari tim T2Q/BPI tempat idGuru terdaftar
 */
function calculateTotalJpGuru(idGuru) {
    if (!idGuru) return { totalJp: 0, mandiriJp: 0, timJp: 0 };

    const jadwal = localData.Jadwal || [];
    const timPengajar = localData.Tim_Pengajar || [];

    // 1. JP Mandiri (Jadwal langsung atas nama Guru ini)
    const mandiriJadwal = jadwal.filter(j => String(j.id_guru) === String(idGuru));
    const mandiriJp = mandiriJadwal.length;

    // 2. Cek apakah Guru ini anggota dari satu/beberapa Tim (id_tim)
    const myTeams = timPengajar.filter(t => String(t.id_guru) === String(idGuru));
    let timJp = 0;

    if (myTeams.length > 0) {
        const teamIds = [...new Set(myTeams.map(t => String(t.id_tim)))];

        teamIds.forEach(idTim => {
            const teamJadwal = jadwal.filter(j => String(j.id_guru) === String(idTim));

            // Ambil slot jam unik agar kelas paralel tidak memicu double count
            const uniqueSlots = new Set();
            teamJadwal.forEach(j => {
                if (j.hari && j.jam_ke) {
                    uniqueSlots.add(`${j.hari}_${j.jam_ke}`);
                }
            });

            timJp += uniqueSlots.size;
        });
    }

    return {
        totalJp: mandiriJp + timJp,
        mandiriJp: mandiriJp,
        timJp: timJp
    };
}

function renderGuruTable() {
    const tbody = document.querySelector('#table-guru tbody');
    if (!tbody) return;

    renderTableControls('Guru', [
        { field: 'jenis_kelamin', label: 'JK', options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
        { field: 'status_karyawan', label: 'Status', options: ['Tetap', 'Kontrak', 'Honorer'] }
    ], renderGuruTable);

    const info = getFilteredAndPaginatedData('Guru');

    if (info.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-3"><i class="fas fa-info-circle me-1"></i> Data guru tidak ditemukan.</td></tr>`;
        renderPaginationControls('Guru', info, renderGuruTable);
        return;
    }

    const timPengajar = localData.Tim_Pengajar || [];

    tbody.innerHTML = info.data.map(row => {
        const idGuru = row.id_guru || '-';
        const jk = row.jenis_kelamin || row.jk || row.JK || '-';
        const status = row.status_karyawan || row.status || row.Status || '-';

        const jkBadge = jk === 'L' ? 'bg-primary' : (jk === 'P' ? 'bg-danger' : 'bg-secondary');
        const statusBadge = status === 'Tetap' ? 'bg-success' : (status === '-' ? 'bg-secondary' : 'bg-info text-dark');

        // Cek apakah ID Guru ini merupakan akun Tim / Dummy
        const isTeamTeacher = String(idGuru).toLowerCase().startsWith('t2q') || 
                              String(idGuru).toLowerCase().startsWith('bpi') || 
                              String(row.nama_lengkap || '').toLowerCase().includes('pengajar');

        // Hitung JP Real untuk Guru
        const jpInfo = calculateTotalJpGuru(idGuru);

        let jpDisplay = '';
        if (isTeamTeacher) {
            // Jika akun tim/dummy, tampilkan jumlah anggota tim
            const memberCount = timPengajar.filter(t => String(t.id_tim) === String(idGuru)).length;
            jpDisplay = `
                <button class="btn btn-xs btn-outline-primary py-0 px-2 small" onclick="openModalAturTim('${idGuru}', '${row.nama_lengkap || idGuru}')" title="Klik untuk mengatur anggota tim guru ini">
                    <i class="fas fa-users me-1"></i> ${memberCount} Anggota
                </button>
            `;
        } else {
            // Tampilkan badge total JP secara bersih tanpa keterangan M/Tim di bawahnya
            jpDisplay = `
                <span class="badge bg-primary fw-bold" title="${jpInfo.mandiriJp} JP Mandiri + ${jpInfo.timJp} JP Tim T2Q/BPI">
                    ${jpInfo.totalJp} JP
                </span>
            `;
        }

        return `
            <tr>
                <td><b>${idGuru}</b></td>
                <td>${row.nip_nik || '-'}</td>
                <td>${row.nama_lengkap || '-'}</td>
                <td><span class="badge ${jkBadge}">${jk}</span></td>
                <td>${row.no_hp || '-'}</td>
                <td>${row.email || '-'}</td>
                <td>${row.jabatan || '-'}</td>
                <td class="text-center">${jpDisplay}</td>
                <td><span class="badge ${statusBadge}">${status}</span></td>
                <td>
                    ${renderActionButtons('Guru', idGuru)}
                    ${isTeamTeacher ? `
                        <button class="btn btn-sm btn-outline-info ms-1" title="Atur Anggota Tim" onclick="openModalAturTim('${idGuru}', '${row.nama_lengkap || idGuru}')">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');

    renderPaginationControls('Guru', info, renderGuruTable);
}

/**
 * Membuka Modal/Dialog Pop-Up untuk Memilih Anggota Tim Pengajar T2Q/BPI
 */
async function openModalAturTim(idTim, namaTim) {
    const allGuru = (localData.Guru || []).filter(g => {
        const idG = String(g.id_guru || '').toLowerCase();
        const namaG = String(g.nama_lengkap || '').toLowerCase();
        return !idG.startsWith('t2q') && !idG.startsWith('bpi') && !namaG.includes('pengajar');
    });

    const currentMembers = (localData.Tim_Pengajar || [])
        .filter(t => String(t.id_tim) === String(idTim))
        .map(t => String(t.id_guru));

    if (allGuru.length === 0) {
        return Swal.fire('Peringatan', 'Belum ada data guru biasa yang terdaftar di Master Guru.', 'warning');
    }

    // Buat daftar checkbox untuk memilih guru
    let checkboxHtml = `<div class="text-start max-h-300 overflow-auto p-2 border rounded" style="max-height: 300px;">`;
    allGuru.forEach(g => {
        const isChecked = currentMembers.includes(String(g.id_guru)) ? 'checked' : '';
        checkboxHtml += `
            <div class="form-check py-1 border-bottom">
                <input class="form-check-input chk-tim-guru" type="checkbox" value="${g.id_guru}" id="chk_g_${g.id_guru}" ${isChecked}>
                <label class="form-check-label fw-bold cursor-pointer" for="chk_g_${g.id_guru}">
                    ${g.nama_lengkap} <small class="text-muted">(${g.id_guru})</small>
                </label>
            </div>
        `;
    });
    checkboxHtml += `</div>`;

    const { isConfirmed } = await Swal.fire({
        title: `Atur Anggota Tim`,
        html: `
            <p class="small text-muted mb-2">Pilih nama-nama guru asli yang mengampu <b>${namaTim} (${idTim})</b>:</p>
            ${checkboxHtml}
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save me-1"></i> Simpan Anggota Tim',
        cancelButtonText: 'Batal',
        focusConfirm: false
    });

    if (isConfirmed) {
        const selectedGuruIds = Array.from(document.querySelectorAll('.chk-tim-guru:checked')).map(c => c.value);
        simpanBatchTimPengajar(idTim, namaTim, selectedGuruIds);
    }
}

/**
 * Mengirimkan data Anggota Tim Pengajar ke Backend GAS
 */
async function simpanBatchTimPengajar(idTim, namaTim, selectedGuruIds) {
    const payloadData = selectedGuruIds.map(idGuru => ({
        id_tim: idTim,
        id_guru: idGuru,
        keterangan: `Anggota Tim ${namaTim}`
    }));

    Swal.fire({
        title: 'Menyimpan Anggota Tim...',
        text: `Memperbarui anggota untuk ${namaTim}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'batchSaveTimPengajar',
                table: 'Tim_Pengajar',
                id_tim: idTim,
                data: payloadData
            })
        });

        const res = await response.json();

        if (res.status === 'success') {
            Swal.fire('Berhasil!', res.message || 'Anggota tim pengajar berhasil diperbarui.', 'success');
            if (typeof loadAllMasterData === 'function') {
                loadAllMasterData();
            }
        } else {
            throw new Error(res.message || 'Gagal menyimpan anggota tim');
        }
    } catch (err) {
        console.error('Error simpanBatchTimPengajar:', err);
        Swal.fire('Error', 'Terjadi kesalahan: ' + err.message, 'error');
    }
}

/**
 * Custom Export Excel Khusus Data Guru
 */
function exportGuruExcel() {
    const data = localData.Guru || [];
    if (data.length === 0) {
        return Swal.fire('Info', 'Tidak ada data guru untuk diekspor.', 'info');
    }

    const formattedData = data.map((item, index) => {
        const jpInfo = calculateTotalJpGuru(item.id_guru);
        return {
            'No': index + 1,
            'ID Guru': item.id_guru || '-',
            'NIP / NIK': item.nip_nik || '-',
            'Nama Lengkap': item.nama_lengkap || '-',
            'L/P': item.jenis_kelamin || item.jk || item.JK || '-',
            'No. HP': item.no_hp || '-',
            'Email': item.email || '-',
            'Jabatan': item.jabatan || '-',
            'Total JP': jpInfo.totalJp,
            'Status Karyawan': item.status_karyawan || item.status || item.Status || '-'
        };
    });

    exportToExcel(formattedData, 'Data_Master_Guru', 'Guru');
}

/**
 * Custom Export PDF Khusus Data Guru
 */
function exportGuruPDF() {
    exportTableToPDF('table-guru', 'Laporan Data Guru SDIT');
}
