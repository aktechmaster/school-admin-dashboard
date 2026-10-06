// ==========================================
// ENGINE IMPOR DATA EXCEL / CSV
// ==========================================

// Skema Kolom Wajib per Modul untuk Validasi Template
const IMPORT_SCHEMAS = {
    Siswa: {
        headers: ['NIS', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 'ID Kelas', 'Status'],
        map: (row) => ({
            nis: String(row['NIS'] || ''),
            nisn: String(row['NISN'] || ''),
            nama_lengkap: row['Nama Lengkap'] || '',
            jenis_kelamin: row['Jenis Kelamin'] || 'L',
            id_kelas: row['ID Kelas'] || '',
            status_aktif: String(row['Status'] || 'Aktif').toLowerCase() === 'aktif'
        })
    },
    Guru: {
        headers: ['NIP', 'Nama Lengkap', 'Jenis Kelamin', 'Status'],
        map: (row) => ({
            nip: String(row['NIP'] || ''),
            nama_lengkap: row['Nama Lengkap'] || '',
            jenis_kelamin: row['Jenis Kelamin'] || 'L',
            status_aktif: String(row['Status'] || 'Aktif').toLowerCase() === 'aktif'
        })
    },
    Mapel: {
        headers: ['Kode Mapel', 'Nama Mata Pelajaran', 'Kategori'],
        map: (row) => ({
            kode_mapel: row['Kode Mapel'] || '',
            nama_mapel: row['Nama Mata Pelajaran'] || '',
            kategori: row['Kategori'] || 'Umum'
        })
    },
    Kelas: {
        headers: ['Nama Kelas', 'Tingkat', 'ID Wali Kelas'],
        map: (row) => ({
            nama_kelas: row['Nama Kelas'] || '',
            tingkat: row['Tingkat'] || '',
            id_guru_wali: row['ID Wali Kelas'] || ''
        })
    }
};

/**
 * Mengunduh Template File Excel Kosong sesuai Modul
 */
function downloadImportTemplate(moduleName) {
    const schema = IMPORT_SCHEMAS[moduleName];
    if (!schema) {
        return Swal.fire('Info', `Template untuk modul ${moduleName} belum tersedia.`, 'info');
    }

    if (typeof XLSX === 'undefined') {
        return Swal.fire('Error', 'Pustaka SheetJS (XLSX) belum dimuat.', 'error');
    }

    // Buat worksheet dengan baris header saja
    const wsData = [schema.headers];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    XLSX.writeFile(wb, `Template_Impor_${moduleName}.xlsx`);
}

/**
 * Dialog Modal untuk Unggah File Excel
 */
function openImportModal(moduleName) {
    const schema = IMPORT_SCHEMAS[moduleName];
    if (!schema) {
        return Swal.fire('Info', `Fitur impor untuk modul ${moduleName} belum didukung.`, 'info');
    }

    Swal.fire({
        title: `Impor Data ${moduleName}`,
        html: `
            <p class="text-muted small mb-3">
                Unggah file Excel (.xlsx/.xls) sesuai dengan format template resmi.
            </p>
            <div class="mb-3 text-start">
                <button type="button" class="btn btn-sm btn-outline-primary w-100 mb-3" onclick="downloadImportTemplate('${moduleName}')">
                    <i class="fas fa-download me-1"></i> Unduh Template Excel (${moduleName})
                </button>
                <label class="form-label fw-bold">Pilih File Excel:</label>
                <input type="file" id="import-file-input" class="form-control" accept=".xlsx, .xls, .csv">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-upload me-1"></i> Proses Impor',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const fileInput = document.getElementById('import-file-input');
            if (!fileInput || !fileInput.files[0]) {
                Swal.showValidationMessage('Silakan pilih file Excel terlebih dahulu!');
                return false;
            }
            return fileInput.files[0];
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            processImportFile(moduleName, result.value);
        }
    });
}

/**
 * Membaca & Memproses File Excel lalu Mengirim ke GAS
 */
function processImportFile(moduleName, file) {
    const reader = new FileReader();

    Swal.fire({
        title: 'Membaca File...',
        text: 'Harap tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Konversi sheet ke JSON
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (rawRows.length === 0) {
                return Swal.fire('Gagal', 'File Excel kosong atau tidak berisi data valid.', 'warning');
            }

            const schema = IMPORT_SCHEMAS[moduleName];
            const parsedData = rawRows.map(schema.map);

            // Kirim Batch ke Backend GAS
            Swal.fire({
                title: 'Mengirim Data...',
                text: `Memproses ${parsedData.length} data ${moduleName} ke server...`,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const payload = {
                action: 'importBatch',
                module: moduleName,
                rows: parsedData
            };

            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                Swal.fire('Berhasil!', `${result.insertedCount || parsedData.length} data ${moduleName} berhasil diimpor.`, 'success')
                    .then(() => {
                        if (typeof loadAllMasterData === 'function') {
                            loadAllMasterData();
                        }
                    });
            } else {
                throw new Error(result.message || 'Gagal menyimpan data impor di server.');
            }

        } catch (error) {
            console.error('Import Error:', error);
            Swal.fire('Gagal Impor', error.message || 'Terjadi kesalahan saat memproses file Excel.', 'error');
        }
    };

    reader.readAsArrayBuffer(file);
}
