// Legacy file: deprecated and intentionally kept as a no-op.
// This project now uses js/config.js and js/app.js as the canonical entry points.
// Loading this file is unnecessary and may cause duplicate global definitions in older pages.
// Safe no-op to preserve backward compatibility without overriding runtime state.

if (typeof window !== 'undefined') {
    window.__legacyScriptNotice = (window.__legacyScriptNotice || 0) + 1;
}
