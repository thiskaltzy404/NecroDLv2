/* ==========================================================================
   NecroDL — script.js
   Frontend-only demo logic. No network requests, no scraping, no backend.
   ========================================================================== */

(function () {
  'use strict';

  const THEME_KEY = 'necrodl-theme';

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const urlInput = document.getElementById('urlInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const inputStatus = document.getElementById('inputStatus');
  const toastEl = document.getElementById('toast');

  /* ------------------------------------------------------------------ */
  /* Theme                                                               */
  /* ------------------------------------------------------------------ */

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      themeToggle.setAttribute('aria-pressed', 'true');
      themeToggle.setAttribute('aria-label', 'Ganti ke mode gelap');
    } else {
      root.setAttribute('data-theme', 'dark');
      themeToggle.setAttribute('aria-pressed', 'false');
      themeToggle.setAttribute('aria-label', 'Ganti ke mode terang');
    }
  }

  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (err) {
      saved = null;
    }
    // Dark is the default whenever there is no saved preference.
    applyTheme(saved === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (err) {
      /* localStorage unavailable — theme still applies for this session */
    }
  }

  themeToggle.addEventListener('click', toggleTheme);

  /* ------------------------------------------------------------------ */
  /* Entrance animation                                                  */
  /* ------------------------------------------------------------------ */

  window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    // Trigger the staged reveal shortly after paint.
    requestAnimationFrame(() => {
      document.body.classList.add('is-ready');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Platform detection (frontend-only, no requests made)                */
  /* ------------------------------------------------------------------ */

  const PLATFORMS = [
    { id: 'tiktok', label: 'TikTok', test: /tiktok\.com/i },
    { id: 'instagram', label: 'Instagram', test: /instagram\.com/i },
    { id: 'youtube', label: 'YouTube', test: /(youtube\.com|youtu\.be)/i },
    { id: 'x', label: 'X', test: /(x\.com|twitter\.com)/i },
  ];

  function detectPlatform(value) {
    for (const platform of PLATFORMS) {
      if (platform.test.test(value)) return platform;
    }
    return null;
  }

  function updateStatus(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      inputStatus.textContent = 'Masukkan URL untuk memulai.';
      inputStatus.removeAttribute('data-state');
      return;
    }

    const platform = detectPlatform(trimmed);

    if (platform) {
      inputStatus.textContent = `Terdeteksi: ${platform.label}. Siap diproses.`;
      inputStatus.setAttribute('data-state', 'detected');
    } else {
      inputStatus.textContent = 'URL belum dikenali. Pastikan link berasal dari platform yang didukung.';
      inputStatus.setAttribute('data-state', 'unknown');
    }
  }

  urlInput.addEventListener('input', () => updateStatus(urlInput.value));

  /* ------------------------------------------------------------------ */
  /* Toast                                                               */
  /* ------------------------------------------------------------------ */

  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Paste                                                               */
  /* ------------------------------------------------------------------ */

  pasteBtn.addEventListener('click', async () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      showToast('Browser tidak mengizinkan akses clipboard. Silakan tempel manual (tekan lama pada kolom input).');
      urlInput.focus();
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast('Clipboard kosong. Salin link terlebih dahulu.');
        return;
      }
      urlInput.value = text.trim();
      updateStatus(urlInput.value);
      showToast('Link berhasil ditempel.');
      urlInput.focus();
    } catch (err) {
      showToast('Izin clipboard ditolak. Silakan tempel manual (tekan lama pada kolom input).');
      urlInput.focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Clear                                                               */
  /* ------------------------------------------------------------------ */

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    updateStatus('');
    urlInput.focus();
  });

  /* ------------------------------------------------------------------ */
  /* Download (demo only — no real download, no network request)        */
  /* ------------------------------------------------------------------ */

  downloadBtn.addEventListener('click', () => {
    const value = urlInput.value.trim();

    if (!value) {
      showToast('Tempelkan URL terlebih dahulu.');
      urlInput.focus();
      return;
    }

    const platform = detectPlatform(value);

    if (platform) {
      showToast(`${platform.label} terdeteksi — backend belum terhubung.`);
    } else {
      showToast('URL belum dikenali. Pastikan link berasal dari platform yang didukung.');
    }
  });
})();
