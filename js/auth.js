// State Sesi Pengguna saat ini
let currentUser = null;

/**
 * Inisialisasi Sesi saat Aplikasi Pertama Dimuat
 */
function initSession() {
    const savedUser = localStorage.getItem('SDIT_USER_SESSION');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            renderUserProfile();
            applyRolePermissions();
            hideLoginModal();
        } catch (e) {
            logout();
        }
    } else {
        showLoginModal();
    }
}

/**
 * Menampilkan Modal / Overlay Login
 */
function showLoginModal() {
    let modalEl = document.getElementById('loginModal');
    if (!modalEl) {
        injectLoginModalDOM();
        modalEl = document.getElementById('loginModal');
    }
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: 'static', keyboard: false });
    bsModal.show();
}

/**
 * Menyembunyikan Modal Login
 */
function hideLoginModal() {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
    }
}

/**
 * Proses Login Pengguna
 */
async function processLogin(event) {
    if (event) event.preventDefault();
    
    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value.trim();

    if (!usernameInput || !passwordInput) {
        return Swal.fire('Peringatan', 'Username dan Password wajib diisi!', 'warning');
    }

    Swal.fire({ title: 'Verifikasi...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    // Pastikan localData.Users sudah terisi
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

    localStorage.setItem('SDIT_USER_SESSION', JSON.stringify(currentUser));
    
    renderUserProfile();
    applyRolePermissions();
    hideLoginModal();

    Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: `Selamat datang, ${currentUser.nama_lengkap}!`,
        timer: 1500,
        showConfirmButton: false
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
            location.reload();
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

/**
 * Inject HTML Modal Login ke dalam Body secara Otomatis
 */
function injectLoginModalDOM() {
    const modalHtml = `
    <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow-lg border-0">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-school me-2"></i>Login Admin SDIT</h5>
                </div>
                <div class="modal-body p-4">
                    <form id="loginForm" onsubmit="processLogin(event)">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Username</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                <input type="text" class="form-control" id="loginUsername" placeholder="Masukkan username" required autocomplete="username">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="loginPassword" placeholder="Masukkan password" required autocomplete="current-password">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold mt-3">
                            <i class="fas fa-sign-in-alt me-2"></i>Masuk Aplikasi
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}
