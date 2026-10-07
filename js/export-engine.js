/* ==========================================================================
   EXPORT ENGINE (Excel, PDF, & Print) - js/export-engine.js
   ========================================================================== */

/**
 * Mengunduh data array / tabel menjadi file Excel (.xlsx)
 * @param {Array} dataArray - Array of objects data yang ingin diekspor
 * @param {String} fileName - Nama file output (tanpa ekstensi)
 * @param {String} sheetName - Nama sheet di dalam Excel
 */
function exportToExcel(dataArray, fileName = 'Data_Export', sheetName = 'Sheet1') {
    if (typeof XLSX === 'undefined') {
        Swal.fire('Error Library', 'Library SheetJS (XLSX) belum dimuat di index.html.', 'error');
        return;
    }

    if (!dataArray || dataArray.length === 0) {
        Swal.fire('Peringatan', 'Tidak ada data untuk diekspor.', 'warning');
        return;
    }

    try {
        // 1. Buat worksheet dari array objek
        const worksheet = XLSX.utils.json_to_sheet(dataArray);

        // 2. Hitung Auto-Width untuk setiap kolom agar teks tidak terpotong
        const objectKeys = Object.keys(dataArray[0] || {});
        const colWidths = objectKeys.map(key => {
            let maxLen = key.toString().length;
            dataArray.forEach(row => {
                const valStr = row[key] ? row[key].toString() : '';
                if (valStr.length > maxLen) maxLen = valStr.length;
            });
            return { wch: Math.min(Math.max(maxLen + 3, 10), 50) }; // min 10, max 50
        });
        worksheet['!cols'] = colWidths;

        // 3. Buat workbook baru & append sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // 4. Format Nama File
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const timeStamp = new Date().toISOString().slice(0, 10);
        
        // 5. Unduh file Excel
        XLSX.writeFile(workbook, `${cleanFileName}_${timeStamp}.xlsx`);

        Swal.fire({
            icon: 'success',
            title: 'Berhasil Ekspor!',
            text: `File ${cleanFileName}.xlsx berhasil diunduh.`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error exportToExcel:', error);
        Swal.fire('Gagal Ekspor', 'Terjadi kesalahan saat memproses file Excel.', 'error');
    }
}

/**
 * Mencetak atau Mengunduh PDF dari Tabel HTML
 * @param {String} tableId - ID dari elemen <table>
 * @param {String} title - Judul Laporan yang akan muncul di atas tabel
 */
function exportTableToPDF(tableId, title = 'Laporan Data') {
    const tableEl = document.getElementById(tableId);
    if (!tableEl) {
        Swal.fire('Error', `Elemen tabel dengan ID "${tableId}" tidak ditemukan.`, 'error');
        return;
    }

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        Swal.fire('Error Library', 'Library jsPDF / autoTable belum dimuat di index.html.', 'error');
        return;
    }

    try {
        const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, Millimeter, A4

        // Judul Laporan & Metadata
        doc.setFontSize(14);
        doc.text(title.toUpperCase(), 14, 15);
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Oleh: ${window.currentUser ? window.currentUser.username : 'System'}`, 14, 21);

        // Generate Tabel PDF menggunakan autoTable
        doc.autoTable({
            html: `#${tableId}`,
            startY: 25,
            theme: 'grid',
            headStyles: { 
                fillColor: [13, 110, 253], 
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: { 
                fontSize: 8, 
                cellPadding: 2,
                overflow: 'linebreak'
            },
            margin: { top: 25, left: 14, right: 14 },
            // Sembunyikan kolom "Aksi" atau kolom terakhir jika berisi tombol
            didParseCell: function (data) {
                if (data.section === 'head' || data.section === 'body') {
                    const headerText = data.row.cells[data.column.index]?.raw?.innerText || '';
                    if (headerText.toLowerCase().includes('aksi') || headerText.toLowerCase().includes('action')) {
                        delete data.row.cells[data.column.index];
                    }
                }
            }
        });

        const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`${cleanTitle}_${dateStr}.pdf`);

    } catch (error) {
        console.error('Error exportTableToPDF:', error);
        Swal.fire('Gagal Ekspor PDF', 'Terjadi kesalahan saat membuat file PDF.', 'error');
    }
}

/**
 * Fungsi untuk Cetak Langsung (Print Preview Browser)
 * @param {String} elementId - ID dari kontainer yang ingin dicetak
 * @param {String} title - Judul dokumen
 */
function printReportSection(elementId, title = 'Cetak Dokumen') {
    const printContent = document.getElementById(elementId);
    if (!printContent) {
        Swal.fire('Error', 'Kontainer cetak tidak ditemukan.', 'error');
        return;
    }

    const winPrint = window.open('', '', 'left=0,top=0,width=1000,height=900,toolbar=0,scrollbars=1,status=0');
    
    // Salin isi HTML dan buat halaman khusus untuk print
    winPrint.document.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                table { width: 100% !important; border-collapse: collapse !important; }
                th, td { padding: 8px !important; border: 1px solid #dee2e6 !important; }
                @media print {
                    .no-print, .btn, .dataTables_filter, .dataTables_length, .pagination { display: none !important; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="mb-4 text-center border-bottom pb-3">
                <h3 class="fw-bold mb-1">${title}</h3>
                <p class="text-muted small mb-0">Sistem Informasi Madrasah/Sekolah - Dicetak pada ${new Date().toLocaleString('id-ID')}</p>
            </div>
            <div>
                ${printContent.innerHTML}
            </div>
        </body>
        </html>
    `);

    winPrint.document.close();
    winPrint.focus();

    // Beri waktu agar stylesheet Bootstrap ter-render sempurna
    setTimeout(() => {
        winPrint.print();
        winPrint.close();
    }, 600);
}
