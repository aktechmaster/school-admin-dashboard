import CONFIG from './config.js';

class AuthManager {
  constructor() {
    this.formLogin = document.getElementById('formLogin');
    this.usernameInput = document.getElementById('username');
    this.passwordInput = document.getElementById('password');
    this.btnLogin = document.getElementById('btnLogin');
    this.loginSpinner = document.getElementById('loginSpinner');
    this.loginBtnText = document.getElementById('loginBtnText');
    this.loginAlert = document.getElementById('loginAlert');
    this.btnTogglePassword = document.getElementById('btnTogglePassword');
    this.iconTogglePassword = document.getElementById('iconTogglePassword');

    this.init();
  }

  init() {
    // 1. Cek jika user sudah login, langsung lempar ke dashboard
    if (this.isAuthenticated()) {
      window.location.href = 'dashboard.html';
      return;
    }

    // 2. Setup Event Listeners
    if (this.formLogin) {
      this.formLogin.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (this.btnTogglePassword) {
      this.btnTogglePassword.addEventListener('click', () => this.togglePasswordVisibility());
    }
  }

  /**
   * Mengosongkan & Menampilkan Alert
   */
  showAlert(message) {
    if (this.loginAlert) {
      this.loginAlert.textContent = message;
      this.loginAlert.classList.remove('d-none');
    }
  }

  hideAlert() {
    if (this.loginAlert) {
      this.loginAlert.classList.add('d-none');
      this.loginAlert.textContent = '';
    }
  }

  /**
   * Mengatur Status Loading Tombol Login
   */
  setLoading(isLoading) {
    if (isLoading) {
      this.btnLogin.disabled = true;
      this.loginSpinner.classList.remove('d-none');
      this.loginBtnText.textContent = ' Memproses...';
    } else {
      this.btnLogin.disabled = false;
      this.loginSpinner.classList.add('d-none');
      this.loginBtnText.innerHTML = '** Masuk';
    }
  }

  /**
   * Show/Hide Password Toggle
   */
  togglePasswordVisibility() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    this.iconTogglePassword.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
  }

  /**
   * Proses submit Form Login
   */
  async handleLogin(event) {
    event.preventDefault();
    this.hideAlert();

    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value.trim();

    if (!username || !password) {
      this.showAlert('Username dan password wajib diisi.');
      return;
    }

    this.setLoading(true);

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Menghindari preflight CORS pada GAS Web App
        },
        body: JSON.stringify({
          action: 'login',
          username: username,
          password: password
        })
      });

      const result = await response.json();

      if (result.status === 'success' || result.success === true) {
        // Simpan data sesi ke localStorage
        const sessionData = {
          user: result.data || { username: username, role: result.role || 'Admin' },
          token: result.token || 'SESSION_TOKEN_' + Date.now(),
          loggedInAt: new Date().toISOString()
        };

        localStorage.setItem(CONFIG.STORAGE_KEY_SESSION, JSON.stringify(sessionData));
        window.location.href = 'dashboard.html';
      } else {
        this.showAlert(result.message || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (error) {
      console.error('Error Login:', error);
      this.showAlert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Cek Status Authenticated
   */
  isAuthenticated() {
    const session = localStorage.getItem(CONFIG.STORAGE_KEY_SESSION);
    if (!session) return false;

    try {
      const parsedSession = JSON.parse(session);
      return !!parsedSession.token;
    } catch (e) {
      localStorage.removeItem(CONFIG.STORAGE_KEY_SESSION);
      return false;
    }
  }

  /**
   * Helper Static Logout untuk dipanggil di mana saja
   */
  static logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEY_SESSION);
    window.location.href = 'index.html';
  }
}

// Inisialisasi Auth Manager saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});

export default AuthManager;
