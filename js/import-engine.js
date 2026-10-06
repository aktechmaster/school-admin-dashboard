// ==========================================
// ENGINE IMPOR DATA EXCEL / CSV
// ==========================================

// Fungsi pembaca nilai Excel yang aman dari perbedaan spasi/kapital
function getExcelVal(row, keyName) {
    if (!row) return '';
    if (row[keyName] !== undefined && row[keyName] !== '') return row[keyName];
    
    const normKey = String(keyName).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let k in row) {
        if (String(k).toLowerCase().replace(/[^a-z0-9]/g, '') === normKey) {
            return row[k];
        }
    }
    return '';
}

const IMPORT_SCHEMAS = {
    Siswa: {
        headers: ['ID Siswa', 'NISN', 'NIS', 'Nama Siswa', 'JK', 'Kelas', 'Ayah', 'Pekerjaan Ayah', 'Ibu', 'Pekerjaan Ibu', 'No HP Ortu', 'Status'],
        map: (row) => ({
            id_siswa: String(getExcelVal(row, 'ID Siswa')),
            nisn: String(getExcelVal(row, 'NISN')),
            nis: String(getExcelVal(row, 'NIS')),
            nama_siswa: getExcelVal(row, 'Nama Siswa'),
            jenis_kelamin: getExcelVal(row, 'JK') || getExcelVal(row, 'Jenis Kelamin') || 'L',
            id_kelas: getExcelVal(row, 'Kelas') || getExcelVal(row, 'ID Kelas'),
            nama_ayah: getExcelVal(row, 'Ayah') || getExcelVal(row, 'Nama Ayah'),
            pekerjaan_ayah: getExcelVal(row, 'Pekerjaan Ayah'),
            nama_ibu: getExcelVal(row, 'Ibu') || getExcelVal(row, 'Nama Ibu'),
            pekerjaan_ibu: getExcelVal(row, 'Pekerjaan Ibu'),
            no_hp_ortu: String(getExcelVal(row, 'No HP Ortu')),
            status_siswa: getExcelVal(row, 'Status') || getExcelVal(row, 'Status Siswa') || 'Aktif'
        })
    },
    Guru: {
        headers: ['ID Guru', 'NIP/NIK', 'Nama Lengkap', 'JK', 'No HP', 'Email', 'Jabatan', 'Status'],
        map: (row) => ({
            id_guru: String(getExcelVal(row, 'ID Guru')),
            nip_nik: String(getExcelVal(row, 'NIP/NIK')),
            nama_lengkap: getExcelVal(row, 'Nama Lengkap'),
            jk: getExcelVal(row, 'JK') || 'L',
            no_hp: String(getExcelVal(row, 'No HP')),
            email: getExcelVal(row, 'Email'),
            jabatan: getExcelVal(row, 'Jabatan'),
            status: getExcelVal(row, 'Status') || 'Tetap'
        })
    },
    Users: {
        headers: ['ID User', 'Username', 'ID Guru', 'Role', 'Status', 'Wali Kelas', 'Wakur', 'T2Q', 'BPI', 'Ekstra'],
        map: (row) => ({
            id_user: String(getExcelVal(row, 'ID User')),
            username: getExcelVal(row, 'Username'),
            id_guru: getExcelVal(row, 'ID Guru'),
            role: getExcelVal(row, 'Role') || 'Guru',
            status: getExcelVal(row, 'Status') || 'Aktif',
            wali_kelas: getExcelVal(row, 'Wali Kelas') || 'Tidak',
            wakur: getExcelVal(row, 'Wakur') || 'Tidak',
            t2q: getExcelVal(row, 'T2Q') || 'Tidak',
            bpi: getExcelVal(row, 'BPI') || 'Tidak',
            ekstra: getExcelVal(row, 'Ekstra') || 'Tidak'
        })
    },
    Kelas: {
        headers: ['ID Kelas', 'Nama Kelas', 'Tingkat', 'Wali Kelas'],
        map: (row) => ({
            id_kelas: String(getExcelVal(row, 'ID Kelas')),
            nama_kelas: getExcelVal(row, 'Nama Kelas'),
            tingkat: getExcelVal(row, 'Tingkat'),
            wali_kelas: getExcelVal(row, 'Wali Kelas')
        })
    },
    Mapel: {
        headers: ['ID Mapel', 'Kode', 'Nama Mata Pelajaran', 'Kategori'],
        map: (row) => ({
            id_mapel: String(getExcelVal(row, 'ID Mapel')),
            kode: getExcelVal(row, 'Kode'),
            nama_mapel: getExcelVal(row, 'Nama Mata Pelajaran'),
            kategori: getExcelVal(row, 'Kategori') || 'Umum'
        })
    },
    Jadwal: {
        headers: ['ID Jadwal', 'Hari', 'Jam Ke', 'Kelas', 'Mapel', 'Guru', 'Tahun Ajaran', 'Semester'],
        map: (row) => ({
            id_jadwal: String(getExcelVal(row, 'ID Jadwal')),
            hari: getExcelVal(row, 'Hari'),
            jam_ke: getExcelVal(row, 'Jam Ke'),
            kelas: getExcelVal(row, 'Kelas'),
            mapel: getExcelVal(row, 'Mapel'),
            guru: getExcelVal(row, 'Guru'),
            tahun_ajaran: getExcelVal(row, 'Tahun Ajaran'),
            semester: getExcelVal(row, 'Semester')
        })
    }
};

// Helper pencari skema impor tahan perbedaan kapital huruf (misal: 'siswa' maupun 'Siswa')
function getSchema(moduleName) {
    if (!moduleName) return null;
    if (IMPORT_SCHEMAS[moduleName]) return IMPORT_SCHEMAS[moduleName];
    
    const key = Object.keys(IMPORT_SCHEMAS).find(
        k => k.toLowerCase() === String(moduleName).toLowerCase()
    );
    return key ? IMPORT_SCHEMAS[key] : null;
}

function downloadImportTemplate(moduleName) {
    const schema = getSchema(moduleName);
    if (!schema) {
        return Swal.fire('Info', `Fungsi import untuk tabel ${moduleName} belum terhubung di import-engine.js.`, 'info');
    }

    if (typeof XLSX === 'undefined') {
        return Swal.fire('Error', 'Pustaka SheetJS (XLSX) belum dimuat.', 'error');
    }

    const wsData = [schema.headers];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    XLSX.writeFile(wb, `Template_Impor_${moduleName}.xlsx`);
}

function openImportModal(moduleName) {
    const schema = getSchema(moduleName);
    if (!schema) {
        return Swal.fire('Info', `Fungsi import untuk tabel ${moduleName} belum terhubung di import-engine.js.`, 'info');
    }

    const realModuleName = Object.keys(IMPORT_SCHEMAS).find(
        k => k.toLowerCase() === String(moduleName).toLowerCase()
    ) || moduleName;

    Swal.fire({
        title: `Impor Data ${realModuleName}`,
        html: `
            <p class="text-muted small mb-3">
                Unggah file Excel (.xlsx / .xls / .csv) sesuai format template resmi.
            </p>
            <div class="mb-3 text-start">
                <button type="button" class="btn btn-sm btn-outline-primary w-100 mb-3" onclick="downloadImportTemplate('${realModuleName}')">
                    <i class="fas fa-download me-1"></i> Unduh Template Excel (${realModuleName})
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
            processImportFile(realModuleName, result.value);
        }
    });
}

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
            
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (rawRows.length === 0) {
                return Swal.fire('Gagal', 'File Excel kosong atau tidak berisi data valid.', 'warning');
            }

            const schema = getSchema(moduleName);
            if (!schema) {
                return Swal.fire('Error', `Schema impor untuk ${moduleName} tidak ditemukan.`, 'error');
            }

            const parsedData = rawRows.map(schema.map);

            const targetModule = Object.keys(IMPORT_SCHEMAS).find(
                k => k.toLowerCase() === String(moduleName).toLowerCase()
            ) || moduleName;

            Swal.fire({
                title: 'Mengirim Data...',
                text: `Memproses ${parsedData.length} data ${targetModule} ke server...`,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const payload = {
                action: 'importBatch',
                module: targetModule,
                rows: parsedData
            };

            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                Swal.fire('Berhasil!', `${result.insertedCount || parsedData.length} data ${targetModule} berhasil diimpor.`, 'success')
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
