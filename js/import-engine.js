// ==========================================
// ENGINE IMPOR DATA EXCEL / CSV (SOLUSI TUNTAS)
// ==========================================

/**
 * Fungsi pembaca nilai Excel yang aman dari variasi nama header, spasi, dan huruf kapital/kecil
 */
function getExcelVal(row, keyNames) {
    if (!row) return '';
    const keys = Array.isArray(keyNames) ? keyNames : [keyNames];
    
    // Tahap 1: Pencocokan Langsung
    for (let key of keys) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
            return String(row[key]).trim();
        }
    }
    
    // Tahap 2: Pencocokan Fleksibel (Abaikan Kapital & Karakater Khusus)
    for (let key of keys) {
        const normKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
        for (let k in row) {
            if (String(k).toLowerCase().replace(/[^a-z0-9]/g, '') === normKey) {
                if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                    return String(row[k]).trim();
                }
            }
        }
    }
    
    return '';
}

const IMPORT_SCHEMAS = {
    Siswa: {
        headers: ['ID Siswa', 'NISN', 'NIS', 'Nama Siswa', 'JK', 'Kelas', 'Ayah', 'Pekerjaan Ayah', 'Ibu', 'Pekerjaan Ibu', 'No HP Ortu', 'Alamat', 'Status'],
        map: (row) => ({
            id_siswa: String(getExcelVal(row, ['ID Siswa', 'id_siswa'])),
            nisn: String(getExcelVal(row, ['NISN', 'nisn'])),
            nis: String(getExcelVal(row, ['NIS', 'nis'])),
            nama_siswa: getExcelVal(row, ['Nama Siswa', 'nama_siswa']),
            jenis_kelamin: getExcelVal(row, ['JK', 'Jenis Kelamin', 'jenis_kelamin']) || 'L',
            id_kelas: getExcelVal(row, ['Kelas', 'ID Kelas', 'id_kelas']),
            nama_ayah: getExcelVal(row, ['Ayah', 'Nama Ayah', 'nama_ayah']),
            pekerjaan_ayah: getExcelVal(row, ['Pekerjaan Ayah', 'pekerjaan_ayah']),
            nama_ibu: getExcelVal(row, ['Ibu', 'Nama Ibu', 'nama_ibu']),
            pekerjaan_ibu: getExcelVal(row, ['Pekerjaan Ibu', 'pekerjaan_ibu']),
            no_hp_ortu: String(getExcelVal(row, ['No HP Ortu', 'no_hp_ortu'])),
            alamat: getExcelVal(row, ['Alamat', 'alamat']),
            status_siswa: getExcelVal(row, ['Status', 'Status Siswa', 'status_siswa']) || 'Aktif'
        })
    },
    Guru: {
        headers: ['ID Guru', 'NIP/NIK', 'Nama Lengkap', 'JK', 'No HP', 'Email', 'Jabatan', 'Status'],
        map: (row) => ({
            id_guru: String(getExcelVal(row, ['ID Guru', 'id_guru'])),
            nip_nik: String(getExcelVal(row, ['NIP/NIK', 'nip_nik'])),
            nama_lengkap: getExcelVal(row, ['Nama Lengkap', 'nama_lengkap']),
            jenis_kelamin: getExcelVal(row, ['JK', 'Jenis Kelamin', 'jenis_kelamin']) || 'L',
            no_hp: String(getExcelVal(row, ['No HP', 'no_hp'])),
            email: getExcelVal(row, ['Email', 'email']),
            jabatan: getExcelVal(row, ['Jabatan', 'jabatan']),
            status_karyawan: getExcelVal(row, ['Status', 'Status Karyawan', 'status_karyawan']) || 'Tetap'
        })
    },
    Users: {
        headers: ['ID User', 'Username', 'ID Guru', 'Role', 'Status', 'Wali Kelas', 'Wakur', 'T2Q', 'BPI', 'Ekstra'],
        map: (row) => ({
            id_user: String(getExcelVal(row, ['ID User', 'id_user'])),
            username: getExcelVal(row, ['Username', 'username']),
            id_guru: getExcelVal(row, ['ID Guru', 'id_guru']),
            role: getExcelVal(row, ['Role', 'role']) || 'Guru',
            status: getExcelVal(row, ['Status', 'status']) || 'Aktif',
            wali_kelas: getExcelVal(row, ['Wali Kelas', 'wali_kelas']) || 'Tidak',
            wakur: getExcelVal(row, ['Wakur', 'wakur']) || 'Tidak',
            t2q: getExcelVal(row, ['T2Q', 't2q']) || 'Tidak',
            bpi: getExcelVal(row, ['BPI', 'bpi']) || 'Tidak',
            ekstra: getExcelVal(row, ['Ekstra', 'ekstra']) || 'Tidak'
        })
    },
    Kelas: {
        headers: ['ID Kelas', 'Nama Kelas', 'Tingkat', 'Wali Kelas'],
        map: (row) => ({
            id_kelas: String(getExcelVal(row, ['ID Kelas', 'id_kelas'])),
            nama_kelas: getExcelVal(row, ['Nama Kelas', 'nama_kelas']),
            tingkat: getExcelVal(row, ['Tingkat', 'tingkat']),
            wali_kelas: getExcelVal(row, ['Wali Kelas', 'wali_kelas'])
        })
    },
    Mapel: {
        headers: ['ID Mapel', 'Kode', 'Nama Mata Pelajaran', 'Kategori'],
        map: (row) => ({
            id_mapel: String(getExcelVal(row, ['ID Mapel', 'id_mapel'])),
            kode: getExcelVal(row, ['Kode', 'kode']),
            nama_mapel: getExcelVal(row, ['Nama Mata Pelajaran', 'nama_mapel']),
            kategori: getExcelVal(row, ['Kategori', 'kategori']) || 'Umum'
        })
    },
    Jadwal: {
        headers: ['ID Jadwal', 'Hari', 'Jam Ke', 'Kelas', 'Mapel', 'Guru', 'Tahun Ajaran', 'Semester'],
        map: (row) => {
            const valIdJadwal = getExcelVal(row, ['ID Jadwal', 'id_jadwal', 'jadwal']);
            const valHari = getExcelVal(row, ['Hari', 'hari']);
            const valJamKe = getExcelVal(row, ['Jam Ke', 'jam_ke', 'jam']);
            const valKelas = getExcelVal(row, ['Kelas', 'ID Kelas', 'id_kelas', 'id_ke', 'kelas']);
            const valMapel = getExcelVal(row, ['Mapel', 'ID Mapel', 'id_mapel', 'id_ma', 'mapel']);
            const valGuru = getExcelVal(row, ['Guru', 'ID Guru', 'id_guru', 'id_g', 'guru']);
            const valTA = getExcelVal(row, ['Tahun Ajaran', 'Tahun Aja', 'tahun_ajaran', 'tahun_aja']);
            const valSem = getExcelVal(row, ['Semester', 'semester', 'semes']);

            // Mengirimkan SEMUA variasi kunci agar kompatibel 100% dengan database Google Sheets
            return {
                id_jadwal: valIdJadwal,
                jadwal: valIdJadwal,

                hari: valHari,

                jam_ke: valJamKe,
                jam: valJamKe,

                id_kelas: valKelas,
                id_ke: valKelas,
                kelas: valKelas,

                id_mapel: valMapel,
                id_ma: valMapel,
                mapel: valMapel,

                id_guru: valGuru,
                id_g: valGuru,
                guru: valGuru,

                tahun_ajaran: valTA,
                tahun_aja: valTA,

                semester: valSem,
                semes: valSem
            };
        }
    }
};

// Helper pencari skema impor tahan perbedaan kapital huruf
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
