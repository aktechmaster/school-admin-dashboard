/**
 * KONFIGURASI UTAMA APLIKASI
 * Ubah Web App URL dengan URL deployment dari Google Apps Script kamu.
 */

const CONFIG = {
  // Nama Sekolah / Aplikasi (Bisa diganti kapan saja)
  APP_NAME: "Sistem Administrasi Sekolah",
  SCHOOL_NAME: "Sekolah Percontohan", 

  // URL Web App Google Apps Script
  WEB_APP_URL: "https://script.google.com/macros/s/GANTI_DENGAN_URL_DEPLOYMENT_KAMU/exec",

  // Key untuk LocalStorage (Sesi Login)
  SESSION_KEY: "admin_school_session",

  // Versi Sistem
  VERSION: "1.0.0-trial"
};

// Mencegah perubahan objek konfigurasi secara tidak sengaja
Object.freeze(CONFIG);
