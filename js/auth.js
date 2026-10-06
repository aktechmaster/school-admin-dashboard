// State Sesi Pengguna saat ini
let currentUser = null;

/**
 * Inisialisasi Sesi saat Aplikasi (Dashboard) Pertama Dimuat
 */
function initSession() {
    const savedUser = localStorage.getItem('SDIT_USER_SESSION');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            renderUserProfile();
            applyRolePermissions();
        } catch (e) {
            logout();
        }
    } else {
        // Jika tidak ada sesi di dashboard, tendang ke halaman login
        window.location.replace('login.html');
    }
}

/**
 * Inisialisasi khusus untuk halaman Login (mencegah user login lagi jika sudah login)
 */
function initLoginPage() {
    const savedUser = localStorage.getItem('SDIT_USER_SESSION');
    if (savedUser) {
        window.location.replace('index.html'); // Langsung ke dashboard
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

    // Ambil data users dari GAS jika belum ada
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

    // Pencarian user
    const user = (localData.Users || []).find(u => 
        String(u.username).toLowerCase() === usernameInput.toLowerCase() && 
        String(u.password_hash) === passwordInput
    );

    if (!user) {
        return Swal.fire('Gagal Login', 'Username atau Password salah!', 'error');
    }

    if (!user.status_aktif) {
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
        is_wali_kelas: Boolean(user.is_wali_kelas),
        is_wakur: Boolean(user.is_wakur),
        is_t2q: Boolean(user.is_t2q),
        is_bpi: Boolean(user.is_bpi),
        is_ekstra: Boolean(user.is_ekstra)
    };

    // Simpan sesi
    localStorage.setItem('SDIT_USER_SESSION', JSON.stringify(currentUser));
    
    Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: `Selamat datang, ${currentUser.nama_lengkap}!`,
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        // Alihkan ke Dashboard setelah login sukses
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
            // Tendang ke halaman login
            window.location.replace('login.html');
        }
    });
}

/**
 * Mengatur Tampilan Elemen Navigasi dan Akses Berdasarkan Role
 */
function applyRolePermissions() {
    if (!currentUser) return;

    const role = currentUser.role;

    const menuMap = {
        dashboard: true,
        users: role === 'Admin',
        guru: ['Admin', 'Kepsek'].includes(role),
        siswa: ['Admin', 'Kepsek', 'WaliKelas'].includes(role) || currentUser.is_wali_kelas,
        kelas: ['Admin', 'Kepsek'].includes(role),
        mapel: ['Admin', 'Kepsek', 'Guru'].includes(role),
        jadwal: ['Admin', 'Kepsek', 'Guru', 'WaliKelas'].includes(role),
        settings: role === 'Admin'
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

    const addButtons = document.querySelectorAll('button[onclick^="openModal"]');
    addButtons.forEach(btn => {
        if (role === 'Admin') {
            btn.classList.remove('d-none');
        } else {
            btn.classList.add('d-none');
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
