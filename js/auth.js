// State Sesi Pengguna saat ini
let currentUser = null;

/**
 * Inisialisasi Sesi saat Aplikasi Pertama Dimuat
 */
function initSession() {
    const savedUser = localStorage.getItem('SDIT_USER_SESSION');
    const isLoginPage = window.location.pathname.toLowerCase().includes('login');

    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
            // Jika sudah login tapi user malah membuka halaman login, lempar ke dashboard
            if (isLoginPage) {
                window.location.href = 'index.html';
                return;
            }
            
            // Render UI jika berada di halaman dashboard (index)
            renderUserProfile();
            applyRolePermissions();
        } catch (e) {
            // Sesi rusak, bersihkan dan tendang ke halaman login
            localStorage.removeItem('SDIT_USER_SESSION');
            if (!isLoginPage) window.location.href = 'login.html';
        }
    } else {
        // Belum login. Jika bukan di halaman login, lempar ke login
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
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

    // Pastikan variabel localData aman untuk diakses, jika belum ada set ke objek kosong
    if (typeof localData === 'undefined') {
        window.localData = {}; 
    }

    // Tarik data dari server jika belum ada di memori
    if (!localData.Users || localData.Users.length === 0) {
        try {
            // Gunakan GAS_URL global atau ambil dari localStorage jika disetting dinamis
            const urlAPI = typeof GAS_URL !== 'undefined' ? GAS_URL : localStorage.getItem('API_URL_GAS');
            
            const response = await fetch(`${urlAPI}?action=readAllMaster`);
            const result = await response.json();
            if (result.status === 'success') {
                localData = result.data;
            }
        } catch (err) {
            return Swal.fire('Error', 'Gagal terhubung ke server backend.', 'error');
        }
    }

    // Pencarian user berdasarkan username dan password/hash
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

    // Dapatkan data profil Guru terkait jika ada
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
        // Alihkan ke Dashboard
        window.location.href = 'index.html';
    });
}

/**
 * Proses Logout Pengguna
 */
function logout() {
    Swal.fire({
        title: 'Keluar Aplikasi?',
        text: 'Anda harus login kembali untuk mengakses dashboard.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
    }).then(res => {
        if (res.isConfirmed) {
            localStorage.removeItem('SDIT_USER_SESSION');
            currentUser = null;
            window.location.href = 'login.html'; // Alihkan ke halaman login terpisah
        }
    });
}

/**
 * Mengatur Tampilan Elemen Navigasi dan Akses Berdasarkan Role
 */
function applyRolePermissions() {
    if (!currentUser) return;

    const role = currentUser.role;

    // Pemetaan ID Menu Navigasi di Sidebar
    const menuMap = {
        dashboard: true, // Semua role bisa melihat dashboard
        users: role === 'Admin',
        guru: ['Admin', 'Kepsek'].includes(role),
        siswa: ['Admin', 'Kepsek', 'WaliKelas'].includes(role) || currentUser.is_wali_kelas,
        kelas: ['Admin', 'Kepsek'].includes(role),
        mapel: ['Admin', 'Kepsek', 'Guru'].includes(role),
        jadwal: ['Admin', 'Kepsek', 'Guru', 'WaliKelas'].includes(role),
        settings: role === 'Admin'
    };

    // Toggle Tampilan Menu di Sidebar
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

    // Sembunyikan Tombol "Tambah Data" untuk Non-Admin
    const addButtons = document.querySelectorAll('button[onclick^="openModal"]');
    addButtons.forEach(btn => {
        if (role === 'Admin') {
            btn.classList.remove('d-none');
        } else {
            btn.classList.add('d-none');
        }
    });

    // Jika pengguna dialihkan ke halaman yang tidak diizinkan, kembalikan ke Dashboard
    const currentActiveSection = document.querySelector('.content-section:not(.d-none)');
    if (currentActiveSection) {
        const activeId = currentActiveSection.id.replace('sec-', '');
        if (menuMap[activeId] === false) {
            // Pastikan fungsi showSection ada di index (bawaan app.js)
            if (typeof showSection === 'function') showSection('dashboard');
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
