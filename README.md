# NecroDL — Frontend

Frontend statis (HTML/CSS/JS murni) untuk **NecroDL**, sebuah konsep website downloader dengan tampilan dark futuristic liquid-glass.

> **Catatan penting:** Ini hanya frontend/UI demo. Tidak ada backend, scraping, API downloader, atau proses unduh sungguhan. Deteksi platform (TikTok/Instagram/YouTube/X) sepenuhnya dilakukan di sisi klien dengan regex sederhana, dan tombol **Download** hanya menampilkan pesan status demo.

## Struktur folder

```
NecroDL/
├── index.html
├── style.css
├── script.js
├── README.md
└── necrodl-logo.png
```

Struktur sengaja dibuat flat (logo sejajar dengan file lain, tanpa subfolder) supaya gampang di-upload ulang lewat GitHub mobile web tanpa perlu bikin folder terpisah.

## Cara menjalankan

Karena tidak ada backend, cukup buka filenya langsung, atau jalankan lewat local server ringan supaya path relatif berjalan mulus di semua browser:

**Opsi 1 — buka langsung**
Klik dua kali `index.html`, buka dengan browser apa saja.

**Opsi 2 — local server (disarankan untuk testing di HP via jaringan lokal)**
```bash
# Python
python3 -m http.server 8000

# atau Node
npx serve .
```
Lalu buka `http://localhost:8000` (atau alamat LAN kamu untuk tes di HP).

## Fitur yang sudah ada

- **Header** — logo NecroDL asli (`assets/necrodl-logo.png`), nama + tagline, dan toggle tema dark/light berbentuk glass pill.
- **Hero** — eyebrow, headline dengan gradient text, deskripsi singkat.
- **Download card** — input URL, tombol **Paste** (Clipboard API dengan fallback pesan ramah jika izin ditolak/tidak didukung), tombol **Clear**, status deteksi platform real-time, dan tombol **Download** full-width yang menampilkan toast demo (bukan proses unduh nyata).
- **Platform yang Didukung** — TikTok, Instagram, YouTube, X ditampilkan sebagai `div` biasa (bukan link/button), murni informasi.
- **Community section** — logo NecroDL asli + 3 tombol sosial yang benar-benar bisa diklik (WhatsApp, Telegram, TikTok), semua `target="_blank"` + `rel="noopener noreferrer"`.
- **Footer** sederhana dengan garis gradient tipis.
- **Tema dark/light** tersimpan di `localStorage` dengan key `necrodl-theme` (default: dark).
- **Animasi masuk** bertahap per elemen (header → eyebrow → headline → deskripsi → tiap card → footer) dengan efek "materialize" (blur + fade + slide).
- **Liquid glass yang benar-benar hidup**: tiap glass card melayang pelan (idle float) dan ada kilau cahaya yang lewat secara berkala.
- **Feedback sentuhan** di semua tombol (Paste, Clear, Download, tombol sosial): efek ripple saat ditekan, ikon yang bergerak halus saat hover/tekan, dan animasi pulse pada glow tombol Download.
- Semua animasi menghormati `prefers-reduced-motion` — kalau tidak ada animasi sama sekali yang muncul, cek pengaturan "Hapus animasi" / "Reduce motion" di HP kamu, karena setting itu sengaja mematikan semuanya untuk aksesibilitas.
- Mobile-first, sudah dicek dari 320px sampai 1440px+ tanpa horizontal scroll, touch target tombol ≥ 44px.

## Mengganti logo

Ganti file `assets/necrodl-logo.png` dengan logo resmi kamu (format PNG transparan, disarankan persegi, minimal 256×256px). Logo dipakai di dua tempat: header dan section "Bergabunglah dengan kami!", dengan `object-fit: contain` supaya tidak gepeng.

## Langkah selanjutnya (di luar scope frontend ini)

Saat siap menyambungkan backend sungguhan (ekstraksi/unduh konten), itu perlu diimplementasikan terpisah dan bertanggung jawab mematuhi Ketentuan Layanan dari masing-masing platform (TikTok, Instagram, YouTube, X) serta hukum hak cipta yang berlaku di yurisdiksi kamu.
