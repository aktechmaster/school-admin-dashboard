// Cache penyimpanan data harian
let harianDataCache = { umum: null, t2q: null };

/**
 * 1. Fungsi Memanggil Persentase Jurnal dari Google Apps Script
 */
async function loadDashboardLaporanData() {
    if (typeof GAS_URL === 'undefined' || !GAS_URL) return;
    try {
        const response = await fetch(`${GAS_URL}?action=getDashboardLaporan`);
        const result = await response.json();
        
        if (result.status === 'success') {
            harianDataCache.umum = result.umum;
            harianDataCache.t2q = result.t2q;

            const elUmum = document.getElementById('kpi-persen-umum');
            const elT2q = document.getElementById('kpi-persen-t2q');

            if (elUmum) elUmum.innerText = result.umum.percentage || '0%';
            if (elT2q) elT2q.innerText = result.t2q.percentage || '0%';
        }
    } catch (err) {
        console.error('Gagal memuat persentase jurnal:', err);
    }
}

/**
 * 2. Fungsi Tombol "Lihat detail" untuk Membuka Modal
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
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

/**
 * 3. Fungsi Memuat Laporan Bulanan/Tahunan untuk Menu Sidebar
 */
async function loadLaporanJurnal(type) {
    const containerId = type === 'T2Q' ? 'container-lap-t2q' : 'container-lap-umum';
    const container = document.getElementById(containerId);
    if (!container || typeof GAS_URL === 'undefined' || !GAS_URL) return;

    container.innerHTML = '<div class="p-3 text-muted"><i class="fas fa-spinner fa-spin me-1"></i> Memuat data laporan dari server...</div>';

    try {
        const response = await fetch(`${GAS_URL}?action=getLaporanJurnal&type=${type}`);
        const result = await response.json();

        if (result.status === 'success' && result.data && result.data.length > 0) {
            // Deteksi kolom mana saja yang merupakan kolom PERSENTASE berdasarkan judul header
            const percentColIndices = new Set();
            result.data.forEach((row, idx) => {
                if (idx < 2) { // Mengecek baris header (Baris 1 & 2)
                    row.forEach((cell, cIdx) => {
                        if (cell && String(cell).toUpperCase().trim().includes('PERSENTASE')) {
                            percentColIndices.add(cIdx);
                        }
                    });
                }
            });

            let tableHtml = '<table class="table table-bordered table-striped table-hover align-middle text-center mb-0" style="font-size:0.8rem;"><tbody>';

            result.data.forEach((row, idx) => {
                const isHeader = idx < 2; // Baris 1 & 2 spreadsheet adalah Header
                const tag = isHeader ? 'th' : 'td';
                const bgClass = isHeader ? 'class="table-dark align-middle"' : '';

                tableHtml += `<tr ${bgClass}>`;
                row.forEach((cell, cIdx) => {
                    let displayValue = (cell !== undefined && cell !== null) ? cell : '';

                    // Format khusus untuk kolom PERSENTASE pada baris isi data
                    if (!isHeader && percentColIndices.has(cIdx)) {
                        if (displayValue !== '' && displayValue !== null && displayValue !== undefined) {
                            const num = Number(displayValue);
                            if (!isNaN(num)) {
                                // Mengubah desimal 0.8 menjadi 80,00% dan 0.833333... menjadi 83,33%
                                displayValue = (num * 100).toFixed(2).replace('.', ',') + '%';
                            }
                        }
                    }

                    tableHtml += `<${tag}>${displayValue}</${tag}>`;
                });
                tableHtml += `</tr>`;
            });

            tableHtml += '</tbody></table>';
            container.innerHTML = tableHtml;
        } else {
            container.innerHTML = '<div class="p-3 text-danger">Data laporan tidak ditemukan atau gagal diproses.</div>';
        }
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-danger">Error memuat data: ${err.message}</div>`;
    }
}
