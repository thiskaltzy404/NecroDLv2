/* NecroDL frontend controller */
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
  const mediaResult = document.getElementById('mediaResult');
  const downloadOptions = document.getElementById('downloadOptions');

  function applyTheme(theme) {
    const light = theme === 'light';
    root.setAttribute('data-theme', light ? 'light' : 'dark');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(light));
      themeToggle.setAttribute('aria-label', light ? 'Ganti ke mode gelap' : 'Ganti ke mode terang');
    }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
    applyTheme(saved === 'light' ? 'light' : 'dark');
  }

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
  });

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
    initRipples();
  });

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
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  function initRipples() {
    document.querySelectorAll('.btn-download, .btn-ghost, .social-btn, .media-action, .carousel-btn').forEach(el => {
      el.addEventListener('pointerdown', e => {
        if (typeof e.clientX === 'number') spawnRipple(el, e.clientX, e.clientY);
      });
    });
  }

  const PLATFORMS = [
    { id: 'tiktok', label: 'TikTok', test: /tiktok\.com/i },
    { id: 'instagram', label: 'Instagram', test: /instagram\.com/i },
    { id: 'youtube', label: 'YouTube', test: /(youtube\.com|youtu\.be)/i },
    { id: 'x', label: 'X', test: /(x\.com|twitter\.com)/i }
  ];

  function detectPlatform(value) {
    return PLATFORMS.find(platform => platform.test.test(value)) || null;
  }

  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  function updateStatus(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      inputStatus.textContent = 'Masukkan URL untuk memulai.';
      inputStatus.removeAttribute('data-state');
      return;
    }
    const platform = detectPlatform(trimmed);
    inputStatus.textContent = platform
      ? `Terdeteksi: ${platform.label}. Siap diproses.`
      : 'URL belum dikenali. Pastikan link berasal dari platform yang didukung.';
    inputStatus.setAttribute('data-state', platform ? 'detected' : 'unknown');
  }

  urlInput?.addEventListener('input', () => updateStatus(urlInput.value));

  pasteBtn?.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.readText) throw new Error('clipboard');
      const text = await navigator.clipboard.readText();
      if (!text) return showToast('Clipboard kosong. Salin link terlebih dahulu.');
      urlInput.value = text.trim();
      updateStatus(urlInput.value);
      showToast('Link berhasil ditempel.');
      urlInput.focus();
    } catch (_) {
      showToast('Tempel link secara manual pada kolom URL.');
      urlInput.focus();
    }
  });

  clearBtn?.addEventListener('click', () => {
    urlInput.value = '';
    updateStatus('');
    clearResults();
    urlInput.focus();
  });

  function clearResults() {
    if (mediaResult) {
      mediaResult.hidden = true;
      mediaResult.innerHTML = '';
    }
    if (downloadOptions) {
      downloadOptions.hidden = true;
      downloadOptions.innerHTML = '';
    }
    downloadBtn.style.display = '';
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<span>Download</span>';
  }

  function firstValue(obj, keys) {
    for (const key of keys) {
      const value = obj?.[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
  }

  function normalizeItems(data) {
    const raw = data?.photos || data?.images || data?.media || data?.items || data?.entries || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item, index) => {
      if (typeof item === 'string') return { url: item, thumbnail: item, index };
      const url = firstValue(item, ['url', 'download_url', 'downloadUrl', 'src', 'media_url', 'mediaUrl', 'video_url', 'videoUrl']);
      const thumbnail = firstValue(item, ['thumbnail', 'thumbnail_url', 'thumbnailUrl', 'preview', 'preview_url', 'cover', 'cover_url']) || url;
      return { ...item, url, thumbnail, index };
    }).filter(item => item.url || item.thumbnail);
  }

  function getThumbnail(data) {
    return firstValue(data, ['thumbnail', 'thumbnail_url', 'thumbnailUrl', 'cover', 'cover_url', 'preview', 'preview_url']);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function createMediaPreview(info, sourceUrl, platform) {
    if (!mediaResult) return;

    const items = normalizeItems(info);
    const isPhoto = info.media_type === 'photo' || items.length > 0 || Array.isArray(info.photos) || Array.isArray(info.images);
    const thumbnail = getThumbnail(info) || items[0]?.thumbnail || '';
    const title = firstValue(info, ['title', 'description', 'caption']) || `${platform.label} media`;

    mediaResult.hidden = false;
    mediaResult.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'glass-card media-card';

    const titleEl = document.createElement('div');
    titleEl.className = 'media-heading';
    titleEl.innerHTML = `<span class="media-type">${isPhoto ? (items.length > 1 ? `${items.length} photos` : 'Photo') : 'Video'}</span><h2>${escapeHtml(title)}</h2>`;
    card.appendChild(titleEl);

    if (isPhoto && items.length > 0) {
      renderPhotoCarousel(card, items, sourceUrl);
    } else if (thumbnail) {
      const preview = document.createElement('div');
      preview.className = 'media-preview';
      preview.innerHTML = `<img src="${escapeHtml(thumbnail)}" alt="Thumbnail media" loading="eager" referrerpolicy="no-referrer">`;
      card.appendChild(preview);
    } else {
      const empty = document.createElement('div');
      empty.className = 'media-preview media-preview-empty';
      empty.textContent = 'Thumbnail tidak diberikan oleh API.';
      card.appendChild(empty);
    }

    const actions = document.createElement('div');
    actions.className = 'media-actions';

    if (isPhoto) {
      addMediaAction(actions, 'Download Photo', 'photo', sourceUrl, items.length > 1 ? 0 : null);
    } else {
      addMediaAction(actions, 'Download Video', 'video', sourceUrl);
    }
    if (info.has_audio || info.audio || info.audio_url || info.audioUrl) {
      addMediaAction(actions, 'Download Audio / MP3', 'audio', sourceUrl);
    }
    card.appendChild(actions);
    mediaResult.appendChild(card);
  }

  function renderPhotoCarousel(card, items, sourceUrl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'photo-carousel';
    let current = 0;

    const viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';
    const image = document.createElement('img');
    image.className = 'carousel-image';
    image.loading = 'eager';
    image.referrerPolicy = 'no-referrer';
    viewport.appendChild(image);
    wrapper.appendChild(viewport);

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel-btn';
    prev.setAttribute('aria-label', 'Foto sebelumnya');
    prev.textContent = '‹';

    const counter = document.createElement('span');
    counter.className = 'carousel-counter';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel-btn';
    next.setAttribute('aria-label', 'Foto berikutnya');
    next.textContent = '›';

    // Arrows intentionally appear only when there are at least 2 photos.
    if (items.length > 1) {
      controls.append(prev, counter, next);
      wrapper.appendChild(controls);
    }

    function render() {
      const item = items[current];
      image.src = item.thumbnail || item.url;
      image.alt = `Foto ${current + 1} dari ${items.length}`;
      counter.textContent = `${current + 1} / ${items.length}`;
    }

    function go(delta) {
      current = (current + delta + items.length) % items.length;
      render();
      const downloadPhoto = card.querySelector('[data-current-photo]');
      if (downloadPhoto) downloadPhoto.dataset.photoIndex = String(current);
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    render();

    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'media-action primary';
    action.dataset.currentPhoto = 'true';
    action.dataset.photoIndex = '0';
    action.textContent = items.length > 1 ? 'Download Foto Ini' : 'Download Photo';
    action.addEventListener('click', () => {
      const item = items[Number(action.dataset.photoIndex) || 0];
      startDownload(item.url || sourceUrl, 'photo', action, Number(action.dataset.photoIndex) || 0, sourceUrl);
    });
    wrapper.appendChild(action);

    card.appendChild(wrapper);
  }

  function addMediaAction(container, label, kind, sourceUrl, index = null) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'media-action' + (kind === 'video' || kind === 'photo' ? ' primary' : '');
    button.textContent = label;
    button.addEventListener('click', () => startDownload(sourceUrl, kind, button, index, sourceUrl));
    container.appendChild(button);
  }

  function startDownload(url, kind, button, index = null, fallbackUrl = url) {
    if (!url) return;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Menyiapkan...';
    const params = new URLSearchParams({ url: url, kind: kind });
    if (index !== null && Number.isFinite(index)) params.set('index', String(index));
    if (fallbackUrl && fallbackUrl !== url) params.set('source', fallbackUrl);
    const href = `${API_BASE}/api/download?${params.toString()}`;
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Download sedang diproses...');
    setTimeout(() => { button.disabled = false; button.textContent = original; }, 2500);
  }

  async function getMediaInfo(url) {
    const response = await fetch(`${API_BASE}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    let data;
    try { data = await response.json(); } catch (_) { throw new Error('Respons server tidak valid.'); }
    if (!response.ok || !data?.ok) throw new Error(data?.detail || data?.error || 'URL tidak dapat diproses.');
    return data;
  }

  downloadBtn?.addEventListener('click', async () => {
    const value = urlInput.value.trim();
    if (!value) { showToast('Tempelkan URL terlebih dahulu.'); urlInput.focus(); return; }
    const platform = detectPlatform(value);
    if (!platform) { showToast('URL belum dikenali. Pastikan link berasal dari platform yang didukung.'); return; }

    clearResults();
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span>Memeriksa...</span>';
    inputStatus.textContent = `Menghubungi server untuk memproses ${platform.label}...`;
    inputStatus.setAttribute('data-state', 'loading');

    try {
      const info = await getMediaInfo(value);
      console.log('NecroDL API:', info);
      inputStatus.textContent = `${info.title || platform.label} — siap didownload.`;
      inputStatus.setAttribute('data-state', 'detected');
      downloadBtn.style.display = 'none';
      createMediaPreview(info, value, platform);
    } catch (error) {
      console.error('NecroDL Error:', error);
      inputStatus.textContent = error.message || 'Terjadi kesalahan saat memproses URL.';
      inputStatus.setAttribute('data-state', 'unknown');
      showToast(error.message || 'Gagal memproses URL.');
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<span>Coba Lagi</span>';
    }
  });

  initTheme();
})();
