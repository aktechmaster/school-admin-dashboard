// State Sesi Pengguna saat ini
let currentUser = null;

// Helper konversi boolean ketat (mencegah string "FALSE"/"0" dikonversi jadi true oleh Boolean())
function toBool(val) {
    if (val === true || val === 1) return true;
    if (typeof val === 'string') {
        const s = val.trim().toUpperCase();
        return s === 'TRUE' || s === '1';
    }
    return false;
}

/**
 * Inisialisasi Sesi saat Aplikasi (Dashboard) Pertama Dimuat
 */
function initSession() {
    const savedUser = localStorage.getItem('SDIT_USER_SESSION');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            // Sanitasi ulang data boolean dari localStorage
            currentUser = {
                ...parsed,
                is_wali_kelas: toBool(parsed.is_wali_kelas),
                is_wakur: toBool(parsed.is_wakur),
                is_t2q: toBool(parsed.is_t2q),
                is_bpi: toBool(parsed.is_bpi),
                is_ekstra: toBool(parsed.is_ekstra)
            };
            renderUserProfile();
            applyRolePermissions();
        } catch (e) {
            logout();
        }
    } else {
        window.location.replace('login.html');
    }
}

/**
 * Inisialisasi khusus untuk halaman Login
 */
function initLoginPage() {
    const savedUser = localStorage.getItem('SDIT_USER_SESSION');
    if (savedUser) {
        window.location.replace('index.html');
    }
}

/**
 * Proses Login Pengguna (Dieksekusi dari login.html)
 */
async function processLogin(event) {
    if (event) event.preventDefault();
    
    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value.trim();

    if (!usernameInput || !passwordInput) {
        return Swal.fire('Peringatan', 'Username dan Password wajib diisi!', 'warning');
    }

    Swal.fire({ title: 'Verifikasi...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    if (!localData.Users || localData.Users.length === 0) {
        try {
            const response = await fetch(`${GAS_URL}?action=readAllMaster`);
            const result = await response.json();
            if (result.status === 'success') {
                localData = result.data;
            }
        } catch (err) {
            return Swal.fire('Error', 'Gagal terhubung ke server backend.', 'error');
        }
    }

    const user = (localData.Users || []).find(u => 
        String(u.username).toLowerCase() === usernameInput.toLowerCase() && 
        String(u.password_hash) === passwordInput
    );

    if (!user) {
        return Swal.fire('Gagal Login', 'Username atau Password salah!', 'error');
    }

    const isUserActive = toBool(user.status_aktif);
    if (!isUserActive) {
        return Swal.fire('Akun Nonaktif', 'Akun Anda telah dinonaktifkan. Hubungi Administrator.', 'error');
    }

    let detailGuru = null;
    if (user.id_guru) {
        detailGuru = (localData.Guru || []).find(g => String(g.id_guru) === String(user.id_guru));
    }

    currentUser = {
        id_user: user.id_user,
        username: user.username,
        role: user.role,
        id_guru: user.id_guru || null,
        nama_lengkap: detailGuru ? detailGuru.nama_lengkap : user.username,
        is_wali_kelas: toBool(user.is_wali_kelas),
        is_wakur: toBool(user.is_wakur),
        is_t2q: toBool(user.is_t2q),
        is_bpi: toBool(user.is_bpi),
        is_ekstra: toBool(user.is_ekstra)
    };

    localStorage.setItem('SDIT_USER_SESSION', JSON.stringify(currentUser));
    
    Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: `Selamat datang, ${currentUser.nama_lengkap}!`,
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.replace('index.html');
    });
}

/**
 * Proses Logout Pengguna
 */
function logout() {
    Swal.fire({
        title: 'Keluar Aplikasi?',
        text: 'Anda akan dialihkan ke halaman login.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
    }).then(res => {
        if (res.isConfirmed) {
            localStorage.removeItem('SDIT_USER_SESSION');
            currentUser = null;
            window.location.replace('login.html');
        }
    });
}

/**
 * Mengatur Tampilan Elemen Navigasi dan Akses Berdasarkan Role (Admin & Wakur)
 */
function applyRolePermissions() {
    if (!currentUser) return;

    const role = currentUser.role;
    const isWakur = role === 'Wakur' || 
                    currentUser.is_wakur === true || 
                    currentUser.is_wakur === 1 || 
                    String(currentUser.is_wakur || '').trim().toUpperCase() === 'TRUE';
    const isAdmin = role === 'Admin';
    const isKepsek = role === 'Kepsek';

    // ===== HAK AKSES KHUSUS MENU LAPORAN & WIDGET (Admin, Kepsek, Wakur) =====
    const canAccessLaporan = isAdmin || isKepsek || isWakur;

    // Sembunyikan/Tampilkan Group Menu Laporan di Sidebar
    document.querySelectorAll('.nav-laporan-group').forEach(el => {
        if (canAccessLaporan) {
            el.classList.remove('d-none');
        } else {
            el.classList.add('d-none');
        }
    });

    // Sembunyikan/Tampilkan Kartu Persentase Jurnal di Dashboard
    document.querySelectorAll('.card-kpi-jurnal').forEach(el => {
        if (canAccessLaporan) {
            el.classList.remove('d-none');
        } else {
            el.classList.add('d-none');
        }
    });

    // Pemetaan menu navigasi standar
    const menuMap = {
        dashboard: true,
        users: isAdmin,
        guru: ['Admin', 'Kepsek'].includes(role) || isWakur,
        siswa: ['Admin', 'Kepsek', 'WaliKelas'].includes(role) || currentUser.is_wali_kelas || isWakur,
        kelas: ['Admin', 'Kepsek'].includes(role) || isWakur,
        mapel: ['Admin', 'Kepsek', 'Guru'].includes(role) || isWakur,
        jadwal: ['Admin', 'Kepsek', 'Guru', 'WaliKelas'].includes(role) || isWakur,
        t2q: true,
        bpi: true,
        hari_efektif: true,
        lap_jurnal_umum: canAccessLaporan,
        lap_jurnal_t2q: canAccessLaporan,
        settings: isAdmin
    };

    Object.keys(menuMap).forEach(sectionKey => {
        const navEl = document.querySelector(`[onclick*="'${sectionKey}'"]`);
        if (navEl) {
            const navItem = navEl.closest('.nav-item') || navEl;
            if (menuMap[sectionKey]) {
                navItem.classList.remove('d-none');
            } else {
                navItem.classList.add('d-none');
            }
        }
    });

    // Kontrol Visibilitas Tombol Header (Tambah Data / Input Massal) per Section
    const sectionPermissions = {
        'sec-users': isAdmin,
        'sec-guru': isAdmin,
        'sec-siswa': isAdmin,
        'sec-kelas': isAdmin,
        'sec-mapel': isAdmin || isWakur,
        'sec-jadwal': isAdmin || isWakur,
        'sec-t2q': isAdmin || isWakur,
        'sec-bpi': isAdmin || isWakur
    };

    Object.keys(sectionPermissions).forEach(secId => {
        const secEl = document.getElementById(secId);
        if (secEl) {
            const canEditSec = sectionPermissions[secId];
            const actionBtns = secEl.querySelectorAll('.section-header-controls button');
            actionBtns.forEach(btn => {
                if (canEditSec) {
                    btn.classList.remove('d-none');
                } else {
                    btn.classList.add('d-none');
                }
            });
        }
    });

    const currentActiveSection = document.querySelector('.content-section:not(.d-none)');
    if (currentActiveSection) {
        const activeId = currentActiveSection.id.replace('sec-', '');
        if (menuMap[activeId] === false) {
            showSection('dashboard');
        }
    }
}

/**
 * Render Profil Pengguna di Header Topbar / Sidebar
 */
function renderUserProfile() {
    if (!currentUser) return;

    const profileNameEl = document.getElementById('user-profile-name');
    const profileRoleEl = document.getElementById('user-profile-role');

    if (profileNameEl) profileNameEl.innerText = currentUser.nama_lengkap;
    if (profileRoleEl) profileRoleEl.innerText = `${currentUser.role} ${currentUser.is_wali_kelas ? '(Wali Kelas)' : ''}`;
}
