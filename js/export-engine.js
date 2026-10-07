// ==========================================
// EXPORT ENGINE (Excel, PDF, & Print)
// ==========================================

/**
 * Mengunduh data array / tabel menjadi file Excel (.xlsx)
 * @param {Array} dataArray - Array of objects data yang ingin diekspor
 * @param {String} fileName - Nama file output (tanpa ekstensi)
 * @param {String} sheetName - Nama sheet di dalam Excel
 */
function exportToExcel(dataArray, fileName = 'Data_Export', sheetName = 'Sheet1') {
    if (!dataArray || dataArray.length === 0) {
        Swal.fire('Peringatan', 'Tidak ada data untuk diekspor.', 'warning');
        return;
    }

    try {
        // Buat worksheet dari array objek
        const worksheet = XLSX.utils.json_to_sheet(dataArray);
        
        // Buat workbook baru
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Unduh file excel
        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        
        Swal.fire({
            icon: 'success',
            title: 'Berjaya Ekspor',
            text: `File ${fileName}.xlsx berhasil diunduh.`,
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
        Swal.fire('Error', 'Elemen tabel tidak ditemukan.', 'error');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, Millimeter, A4

        // Judul Laporan
        doc.setFontSize(16);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

        // Generate Tabel PDF dengan AutoTable
        doc.autoTable({
            html: `#${tableId}`,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [13, 110, 253] }, // Warna biru Bootstrap
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { top: 28 }
        });

        // Simpan PDF
        doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);

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

    const winPrint = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    
    winPrint.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                body { font-family: 'Poppins', sans-serif; padding: 20px; }
                @media print {
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="mb-4 text-center border-bottom pb-3">
                <h3 class="fw-bold">${title}</h3>
                <p class="text-muted small">Sistem Informasi SDIT - ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            ${printContent.innerHTML}
        </body>
        </html>
    `);

    winPrint.document.close();
    winPrint.focus();
    setTimeout(() => {
        winPrint.print();
        winPrint.close();
    }, 500);
}
