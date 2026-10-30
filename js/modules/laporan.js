// Cache penyimpanan data
let harianDataCache = { umum: null, t2q: null, absensi: null };
let laporanJurnalCache = { Umum: null, T2Q: null };

/**
 * 1. Fungsi Memanggil Persentase Jurnal & Kehadiran dari Google Apps Script
 */
async function loadDashboardLaporanData() {
    if (typeof GAS_URL === 'undefined' || !GAS_URL) return;
    try {
        const response = await fetch(`${GAS_URL}?action=getDashboardLaporan`);
        const result = await response.json();

        // --- TAMBAHKAN DUA BARIS INI UNTUK CEK RESPON GAS ---
        console.log("=== RESPON DARI GAS ===", result);
        console.log("Data Absensi:", result.absensi);
        
        if (result.status === 'success') {
            harianDataCache.umum = result.umum;
            harianDataCache.t2q = result.t2q;
            harianDataCache.absensi = result.absensi;

            const elUmum = document.getElementById('kpi-persen-umum');
            const elT2q = document.getElementById('kpi-persen-t2q');
            const elAbsensi = document.getElementById('kpi-persen-absensi');

            if (elUmum) elUmum.innerText = result.umum ? result.umum.percentage || '0%' : '0%';
            if (elT2q) elT2q.innerText = result.t2q ? result.t2q.percentage || '0%' : '0%';
            if (elAbsensi) elAbsensi.innerText = result.absensi ? result.absensi.percentage || '0%' : '0%';
        }
    } catch (err) {
        console.error('Gagal memuat persentase jurnal & kehadiran:', err);
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
    // Konversi nilai realisasi ke angka
    const realisasiVal = Number(r.realisasi) || 0;
    
    // Jika lebih dari 0 diberi badge hijau, jika 0 atau kosong ditampilkan tanpa warna/badge
    const realisasiHtml = realisasiVal > 0 
        ? `<span class="badge bg-success">${r.realisasi}</span>` 
        : `<span class="text-muted">${r.realisasi || 0}</span>`;

    tbody.insertAdjacentHTML('beforeend', `
        <tr>
            <td class="fw-bold">${r.no}</td>
            <td class="text-start">${r.nama}</td>
            <td><span class="badge bg-secondary">${r.harusDiisi}</span></td>
            <td>${realisasiHtml}</td>
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
 * 3. Fungsi Memuat Laporan Bulanan/Tahunan (Dengan Sistem Cache)
 * @param {string} type - 'Umum' atau 'T2Q'
 * @param {boolean} forceReload - Set true jika ingin memaksa ambil data baru dari server
 */
async function loadLaporanJurnal(type, forceReload = false) {
    const containerId = type === 'T2Q' ? 'container-lap-t2q' : 'container-lap-umum';
    const container = document.getElementById(containerId);
    if (!container || typeof GAS_URL === 'undefined' || !GAS_URL) return;

    // A. Jika TIDAK force reload & data sudah ada di cache -> Render LANGSUNG tanpa loading!
    if (!forceReload && laporanJurnalCache[type]) {
        renderTableLaporan(container, laporanJurnalCache[type]);
        return;
    }

    // B. Jika cache kosong ATAU tombol Reload diklik -> Ambil dari server
    container.innerHTML = '<div class="p-3 text-muted"><i class="fas fa-spinner fa-spin me-1"></i> Memuat data laporan dari server...</div>';

    try {
        const response = await fetch(`${GAS_URL}?action=getLaporanJurnal&type=${type}`);
        const result = await response.json();

        if (result.status === 'success' && result.data && result.data.length > 0) {
            // Simpan hasil ke cache
            laporanJurnalCache[type] = result.data;
            // Render tabel
            renderTableLaporan(container, result.data);
        } else {
            container.innerHTML = '<div class="p-3 text-danger">Data laporan tidak ditemukan atau gagal diproses.</div>';
        }
    } catch (err) {
        container.innerHTML = `<div class="p-3 text-danger">Error memuat data: ${err.message}</div>`;
    }
}

/**
 * Helper internal untuk merender elemen HTML tabel laporan dengan Freeze Header
 */
function renderTableLaporan(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="p-3 text-muted">Data laporan kosong.</div>';
        return;
    }

    // Deteksi indeks kolom PERSENTASE
    const percentColIndices = new Set();
    data.forEach((row, idx) => {
        if (idx < 2) {
            row.forEach((cell, cIdx) => {
                if (cell && String(cell).toUpperCase().trim().includes('PERSENTASE')) {
                    percentColIndices.add(cIdx);
                }
            });
        }
    });

    // Wrapper scrollable untuk mengunci header saat scroll vertikal & horizontal
    let tableHtml = `
        <div class="table-responsive-laporan" style="max-height: 70vh; overflow: auto; border: 1px solid #dee2e6;">
            <table class="table table-bordered table-striped table-hover align-middle text-center mb-0" style="font-size:0.8rem; border-collapse: separate; border-spacing: 0;">
                <thead>
    `;

    // Render Baris Header (Baris 0 dan 1)
    data.forEach((row, idx) => {
        if (idx < 2) {
            const trClass = idx === 0 ? 'header-row-1' : 'header-row-2';
            tableHtml += `<tr class="${trClass}">`;
            row.forEach(cell => {
                const displayValue = (cell !== undefined && cell !== null) ? cell : '';
                tableHtml += `<th class="bg-dark text-white align-middle">${displayValue}</th>`;
            });
            tableHtml += '</tr>';
            
            // Tutup <thead> dan buka <tbody> setelah baris header kedua
            if (idx === 1) {
                tableHtml += '</thead><tbody>';
            }
        } else {
            // Render Baris Data
            tableHtml += '<tr>';
            row.forEach((cell, cIdx) => {
                let displayValue = (cell !== undefined && cell !== null) ? cell : '';

                if (percentColIndices.has(cIdx) && displayValue !== '' && displayValue !== null) {
                    const num = Number(displayValue);
                    if (!isNaN(num)) {
                        displayValue = (num * 100).toFixed(2).replace('.', ',') + '%';
                    }
                }

                tableHtml += `<td>${displayValue}</td>`;
            });
            tableHtml += '</tr>';
        }
    });

    tableHtml += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHtml;
}

/**
 * 4. Fungsi Ekspor Laporan ke Format Excel (.xlsx)
 */
function exportLaporanExcel(type) {
    const rawData = laporanJurnalCache[type];
    if (!rawData || rawData.length === 0) {
        Swal.fire('Perhatian', 'Data laporan belum dimuat atau kosong. Silakan tunggu hingga tabel muncul.', 'warning');
        return;
    }

    // Deteksi indeks kolom PERSENTASE dari baris header
    const percentColIndices = new Set();
    rawData.forEach((row, idx) => {
        if (idx < 2) {
            row.forEach((cell, cIdx) => {
                if (cell && String(cell).toUpperCase().trim().includes('PERSENTASE')) {
                    percentColIndices.add(cIdx);
                }
            });
        }
    });

    // Format ulang angka desimal ke persen murni agar rapi saat dibuka di MS Excel
    const processedData = rawData.map((row, idx) => {
        if (idx < 2) return row; // Baris header
        return row.map((cell, cIdx) => {
            if (percentColIndices.has(cIdx) && cell !== '' && cell !== null && cell !== undefined) {
                const num = Number(cell);
                if (!isNaN(num)) {
                    return (num * 100).toFixed(2).replace('.', ',') + '%';
                }
            }
            return cell !== undefined && cell !== null ? cell : '';
        });
    });

    // Buat Workbook SheetJS
    const ws = XLSX.utils.aoa_to_sheet(processedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Laporan ${type}`);

    // Unduh File
    const filename = `Laporan_Jurnal_${type}_SDIT_AlKautsar.xlsx`;
    XLSX.writeFile(wb, filename);
}

/**
 * 5. Fungsi Ekspor Laporan ke PDF (Dipecah per Semester agar Muat Utuh & Rapi)
 */
function exportLaporanPDF(type) {
    const rawData = laporanJurnalCache[type];
    if (!rawData || rawData.length === 0) {
        Swal.fire('Perhatian', 'Data laporan belum dimuat atau kosong.', 'warning');
        return;
    }

    const containerId = type === 'T2Q' ? 'container-lap-t2q' : 'container-lap-umum';
    const tableElement = document.getElementById(containerId);

    if (!tableElement) return;

    // Ambil elemen tabel dari DOM
    const origTable = tableElement.querySelector('table');
    if (!origTable) return;

    // Clone tabel untuk memanipulasi kolom
    const tableSem1 = origTable.cloneNode(true);
    const tableSem2 = origTable.cloneNode(true);

    // Indeks Kolom: 
    // 0: No, 1: Nama
    // Juli-Desember (Sem 1): Kolom 2 s/d 19
    // Januari-Juni (Sem 2): Kolom 20 s/d 37
    
    // Potong kolom untuk Semester 1 (Hapus kolom Januari-Juni)
    tableSem1.querySelectorAll('tr').forEach(tr => {
        const cells = Array.from(tr.children);
        for (let i = cells.length - 1; i >= 20; i--) {
            if (cells[i]) cells[i].remove();
        }
    });

    // Potong kolom untuk Semester 2 (Simpan No, Nama, & Kolom Januari-Juni)
    tableSem2.querySelectorAll('tr').forEach(tr => {
        const cells = Array.from(tr.children);
        for (let i = 19; i >= 2; i--) {
            if (cells[i]) cells[i].remove();
        }
    });

    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Laporan Jurnal ${type} - SDIT Al-Kautsar</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @page { 
                    size: A4 landscape; 
                    margin: 10mm; 
                }
                body { 
                    font-family: Arial, sans-serif; 
                    font-size: 9px; 
                    padding: 5px; 
                    background: white;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .report-header { 
                    text-align: center; 
                    margin-bottom: 12px; 
                }
                .report-header h4 { 
                    font-weight: bold; 
                    margin: 0; 
                    font-size: 14px; 
                }
                .report-header h6 { 
                    color: #333; 
                    margin-top: 2px; 
                    font-size: 11px; 
                }
                .section-title {
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 15px;
                    margin-bottom: 5px;
                    color: #0d6efd;
                    border-bottom: 2px solid #0d6efd;
                    padding-bottom: 2px;
                }
                table { 
                    width: 100% !important; 
                    border-collapse: collapse !important; 
                    font-size: 8px !important; 
                    margin-bottom: 10px;
                }
                th, td { 
                    border: 1px solid #333 !important; 
                    padding: 4px 2px !important; 
                    text-align: center !important; 
                    white-space: nowrap !important; 
                }
                th { 
                    background-color: #212529 !important; 
                    color: white !important; 
                    font-weight: bold !important; 
                }
                tr:nth-child(even) td { 
                    background-color: #f8f9fa !important; 
                }
                .page-break {
                    page-break-before: always;
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <h4>SDIT AL-KAUTSAR</h4>
                <h6>REKAP LAPORAN JURNAL ${type.toUpperCase()}</h6>
            </div>

            <!-- BAGIAN SEMESTER 1 -->
            <div class="section-title">SEMESTER 1 (JULI - DESEMBER)</div>
            ${tableSem1.outerHTML}

            <!-- BREAK KE HALAMAN BARU UNTUK SEMESTER 2 -->
            <div class="page-break"></div>

            <div class="report-header">
                <h4>SDIT AL-KAUTSAR</h4>
                <h6>REKAP LAPORAN JURNAL ${type.toUpperCase()}</h6>
            </div>

            <!-- BAGIAN SEMESTER 2 -->
            <div class="section-title">SEMESTER 2 (JANUARI - JUNI)</div>
            ${tableSem2.outerHTML}

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 400);
                };
            <\/script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
}

/**
 * Fungsi Tombol "Lihat detail" untuk Membuka Modal Detail Kehadiran Guru & Karyawan
 */
function openModalDetailAbsensi() {
    const tbody = document.getElementById('tbody-detail-absensi');
    const dataObj = harianDataCache.absensi;

    if (!tbody) return;
    tbody.innerHTML = '';

    if (!dataObj || !dataObj.rows || dataObj.rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-muted py-3">Data kehadiran harian tidak tersedia.</td></tr>`;
    } else {
        dataObj.rows.forEach(r => {
            const isHadir = String(r.today).trim() === '1';
            const statusBadge = isHadir 
                ? `<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Hadir</span>`
                : `<span class="badge bg-danger"><i class="fas fa-times-circle me-1"></i>Absen</span>`;

            tbody.insertAdjacentHTML('beforeend', `
                <tr class="${!isHadir ? 'table-danger' : ''}">
                    <td class="fw-bold">${r.no}</td>
                    <td class="text-start fw-semibold">${r.nama}</td>
                    <td><span class="badge bg-secondary">${r.total1Th}</span></td>
                    <td>${r.izin > 0 ? `<span class="badge bg-warning text-dark">${r.izin}</span>` : '0'}</td>
                    <td>${r.sakit > 0 ? `<span class="badge bg-info text-dark">${r.sakit}</span>` : '0'}</td>
                    <td>${r.alfa > 0 ? `<span class="badge bg-danger">${r.alfa}</span>` : '0'}</td>
                    <td>${r.dinasLuar > 0 ? `<span class="badge bg-primary">${r.dinasLuar}</span>` : '0'}</td>
                    <td>${statusBadge}</td>
                </tr>
            `);
        });
    }

    const modalEl = document.getElementById('modalDetailAbsensi');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}
