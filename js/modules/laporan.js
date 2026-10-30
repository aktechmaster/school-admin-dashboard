// Variable cache menyimpan data laporan harian
let harianDataCache = { umum: null, t2q: null };

/**
 * Memuat persentase dan detail harian untuk Dashboard
 */
async function loadDashboardLaporanData() {
    if (!GAS_URL) return;
    try {
        const response = await fetch(`${GAS_URL}?action=getDashboardLaporan`);
        const result = await response.json();
        
        if (result.status === 'success') {
            harianDataCache.umum = result.umum;
            harianDataCache.t2q = result.t2q;

            const elUmum = document.getElementById('kpi-persen-umum');
            const elT2q = document.getElementById('kpi-persen-t2q');

            if (elUmum) elUmum.innerText = result.umum.percentage;
            if (elT2q) elT2q.innerText = result.t2q.percentage;
        }
    } catch (err) {
        console.error('Gagal memuat persentase jurnal:', err);
    }
}

/**
 * Membuka Modal Detail Harian (Hanya Kolom A, B, D, E, H)
 */
function openModalDetailHarian(type) {
    const titleEl = document.getElementById('titleModalHarian');
    const tbody = document.getElementById('tbody-detail-harian');
    const dataObj = type === 'T2Q' ? harianDataCache.t2q : harianDataCache.umum;

    if (titleEl) titleEl.innerText = `Detail Jurnal Harian ${type}`;
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!dataObj || !dataObj.rows || dataObj.rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-muted py-3">Data harian tidak tersedia.</td></tr>`;
    } else {
        dataObj.rows.forEach(r => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td class="fw-bold">${r.no}</td>
                    <td class="text-start">${r.nama}</td>
                    <td><span class="badge bg-secondary">${r.harusDiisi}</span></td>
                    <td><span class="badge bg-success">${r.realisasi}</span></td>
                    <td class="fw-bold text-primary">${r.totalGuru}</td>
                </tr>
            `);
        });
    }

    const modalEl = document.getElementById('modalDetailHarian');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

/**
 * Memuat Rekap Laporan Bulanan/Tahunan ke Halaman Laporan
 */
async function loadLaporanJurnal(type) {
    const containerId = type === 'T2Q' ? 'container-lap-t2q' : 'container-lap-umum';
    const container = document.getElementById(containerId);
    if (!container || !GAS_URL) return;

    container.innerHTML = '<p class="text-muted"><i class="fas fa-spinner fa-spin me-1"></i> Memuat data laporan...</p>';

    try {
        const response = await fetch(`${GAS_URL}?action=getLaporanJurnal&type=${type}`);
        const result = await response.json();

        if (result.status === 'success' && result.data && result.data.length > 0) {
            let tableHtml = '<table class="table table-bordered table-striped table-hover align-middle text-center" style="font-size:0.8rem;"><tbody>';
            
            result.data.forEach((row, idx) => {
                const tag = idx < 2 ? 'th' : 'td'; // Baris 1 & 2 sebagai header
                const bgClass = idx < 2 ? 'class="table-dark"' : '';
                
                tableHtml += `<tr ${bgClass}>`;
                row.forEach(cell => {
                    tableHtml += `<${tag}>${cell !== undefined ? cell : ''}</${tag}>`;
                });
                tableHtml += `</tr>`;
            });

            tableHtml += '</tbody></table>';
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = '<p class="text-danger">Gagal atau tidak ada data laporan.</p>';
        }
    } catch (err) {
        container.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
    }
}
