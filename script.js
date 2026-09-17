/* ==========================================================================
   NecroDL — script.js
   Connected to NecroDL API
   ========================================================================== */

(function () {
  'use strict';

  const API_BASE = 'https://necrodlapi-iz9wptub.b4a.run';
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

    applyTheme(saved === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';

    applyTheme(next);

    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (err) {}
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  /* ------------------------------------------------------------------ */
  /* Entrance animation                                                  */
  /* ------------------------------------------------------------------ */

  window.addEventListener('DOMContentLoaded', () => {
    initTheme();

    requestAnimationFrame(() => {
      document.body.classList.add('is-ready');
    });

    initRipples();
  });

  /* ------------------------------------------------------------------ */
  /* Ripple                                                              */
  /* ------------------------------------------------------------------ */

  function spawnRipple(target, x, y) {
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;

    const ripple = document.createElement('span');

    ripple.className = 'ripple-el';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - rect.left - size / 2}px`;
    ripple.style.top = `${y - rect.top - size / 2}px`;

    target.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }

  function initRipples() {
    const rippleTargets = document.querySelectorAll(
      '.btn-download, .btn-ghost, .social-btn'
    );

    rippleTargets.forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;

        if (typeof x === 'number' && typeof y === 'number') {
          spawnRipple(el, x, y);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Platform detection                                                  */
  /* ------------------------------------------------------------------ */

  const PLATFORMS = [
    {
      id: 'tiktok',
      label: 'TikTok',
      test: /tiktok\.com/i
    },
    {
      id: 'instagram',
      label: 'Instagram',
      test: /instagram\.com/i
    },
    {
      id: 'youtube',
      label: 'YouTube',
      test: /(youtube\.com|youtu\.be)/i
    },
    {
      id: 'x',
      label: 'X',
      test: /(x\.com|twitter\.com)/i
    }
  ];

  function detectPlatform(value) {
    for (const platform of PLATFORMS) {
      if (platform.test.test(value)) {
        return platform;
      }
    }

    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Toast                                                               */
  /* ------------------------------------------------------------------ */

  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }

  /* ------------------------------------------------------------------ */
  /* Status                                                              */
  /* ------------------------------------------------------------------ */

  function updateStatus(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      inputStatus.textContent = 'Masukkan URL untuk memulai.';
      inputStatus.removeAttribute('data-state');
      return;
    }

    const platform = detectPlatform(trimmed);

    if (platform) {
      inputStatus.textContent =
        `Terdeteksi: ${platform.label}. Siap diproses.`;

      inputStatus.setAttribute('data-state', 'detected');
    } else {
      inputStatus.textContent =
        'URL belum dikenali. Pastikan link berasal dari platform yang didukung.';

      inputStatus.setAttribute('data-state', 'unknown');
    }
  }

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      updateStatus(urlInput.value);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Paste                                                               */
  /* ------------------------------------------------------------------ */

  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        showToast(
          'Browser tidak mengizinkan clipboard. Tempel link secara manual.'
        );

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
        showToast(
          'Izin clipboard ditolak. Silakan tempel link secara manual.'
        );

        urlInput.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Clear                                                               */
  /* ------------------------------------------------------------------ */

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      urlInput.value = '';

      updateStatus('');

      removeDownloadOptions();

      urlInput.focus();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Download options                                                    */
  /* ------------------------------------------------------------------ */

  let downloadOptions = null;

  function createDownloadOptions() {
    if (downloadOptions) return downloadOptions;

    downloadOptions = document.createElement('div');

    downloadOptions.id = 'downloadOptions';

    downloadOptions.style.display = 'flex';
    downloadOptions.style.flexDirection = 'column';
    downloadOptions.style.gap = '10px';
    downloadOptions.style.marginTop = '12px';

    downloadBtn.insertAdjacentElement(
      'afterend',
      downloadOptions
    );

    return downloadOptions;
  }

  function removeDownloadOptions() {
    if (downloadOptions) {
      downloadOptions.remove();
      downloadOptions = null;
    }

    downloadBtn.style.display = '';
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download';
  }

  /* ------------------------------------------------------------------ */
  /* Create download button                                              */
  /* ------------------------------------------------------------------ */

  function addDownloadButton(label, kind, url) {
    const container = createDownloadOptions();

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'btn-ghost';
    button.textContent = label;

    button.style.width = '100%';
    button.style.cursor = 'pointer';

    button.addEventListener('click', () => {
      startDownload(url, kind, button);
    });

    container.appendChild(button);
  }

  /* ------------------------------------------------------------------ */
  /* Start actual download                                               */
  /* ------------------------------------------------------------------ */

  function startDownload(url, kind, button) {
    if (!url) return;

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = 'Menyiapkan download...';

    showToast('Download sedang diproses...');

    const downloadUrl =
      `${API_BASE}/api/download?url=${encodeURIComponent(url)}&kind=${encodeURIComponent(kind)}`;

    const link = document.createElement('a');

    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener';

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 2500);
  }

  /* ------------------------------------------------------------------ */
  /* Ask backend for information                                         */
  /* ------------------------------------------------------------------ */

  async function getMediaInfo(url) {
    const response = await fetch(`${API_BASE}/api/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    });

    let data = null;

    try {
      data = await response.json();
    } catch (err) {
      throw new Error('Respons server tidak valid.');
    }

    if (!response.ok || !data.ok) {
      throw new Error(
        data?.detail || 'URL tidak dapat diproses.'
      );
    }

    return data;
  }

  /* ------------------------------------------------------------------ */
  /* Main download button                                                */
  /* ------------------------------------------------------------------ */

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const value = urlInput.value.trim();

      if (!value) {
        showToast('Tempelkan URL terlebih dahulu.');

        urlInput.focus();

        return;
      }

      const platform = detectPlatform(value);

      if (!platform) {
        showToast(
          'URL belum dikenali. Pastikan link berasal dari platform yang didukung.'
        );

        return;
      }

      removeDownloadOptions();

      downloadBtn.disabled = true;
      downloadBtn.textContent = 'Memeriksa...';

      inputStatus.textContent =
        `Menghubungi server untuk memproses ${platform.label}...`;

      inputStatus.setAttribute('data-state', 'loading');

      try {
        const info = await getMediaInfo(value);

        console.log('NecroDL API:', info);

        removeDownloadOptions();

        downloadBtn.style.display = 'none';

        inputStatus.setAttribute('data-state', 'detected');

        inputStatus.textContent =
          `${info.title || platform.label} — siap didownload.`;

        /*
         * VIDEO
         * Tampilkan Video + Audio jika tersedia.
         */
        if (info.media_type === 'video') {
          addDownloadButton(
            '⬇ Download Video',
            'video',
            value
          );

          if (info.has_audio) {
            addDownloadButton(
              '♫ Download Audio / MP3',
              'audio',
              value
            );
          }
        }

        /*
         * PHOTO
         * Tampilkan Photo + Audio jika tersedia.
         */
        else if (info.media_type === 'photo') {
          addDownloadButton(
            '▧ Download Photo',
            'photo',
            value
          );

          if (info.has_audio) {
            addDownloadButton(
              '♫ Download Audio / MP3',
              'audio',
              value
            );
          }
        }

        /*
         * Jika tipe media tidak dikenali.
         */
        else {
          showToast(
            'Jenis media belum didukung oleh API.'
          );

          downloadBtn.style.display = '';
          downloadBtn.disabled = false;
          downloadBtn.textContent = 'Download';
        }

      } catch (error) {
        console.error('NecroDL Error:', error);

        inputStatus.textContent =
          error.message || 'Terjadi kesalahan saat memproses URL.';

        inputStatus.setAttribute('data-state', 'unknown');

        showToast(
          error.message || 'Gagal memproses URL.'
        );

        downloadBtn.style.display = '';
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Coba Lagi';
      }
    });
  }

})();
