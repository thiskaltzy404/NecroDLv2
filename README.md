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
└── assets/
    └── necrodl-logo.png
```

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
- **Animasi masuk** bertahap saat halaman pertama dibuka, menghormati `prefers-reduced-motion`.
- Mobile-first, sudah dicek dari 320px sampai 1440px+ tanpa horizontal scroll, touch target tombol ≥ 44px.

## Mengganti logo

Ganti file `assets/necrodl-logo.png` dengan logo resmi kamu (format PNG transparan, disarankan persegi, minimal 256×256px). Logo dipakai di dua tempat: header dan section "Bergabunglah dengan kami!", dengan `object-fit: contain` supaya tidak gepeng.

## Langkah selanjutnya (di luar scope frontend ini)

Saat siap menyambungkan backend sungguhan (ekstraksi/unduh konten), itu perlu diimplementasikan terpisah dan bertanggung jawab mematuhi Ketentuan Layanan dari masing-masing platform (TikTok, Instagram, YouTube, X) serta hukum hak cipta yang berlaku di yurisdiksi kamu.
