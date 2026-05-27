# Habit Forge — Brand Assets

Paket aset visual untuk aplikasi **Habit Forge**.
Disusun untuk dipakai langsung di VS Code → drop ke project kamu.

```
assets/
├── logo/             ← logo & symbol (SVG, vector, scalable)
├── favicon/          ← favicon + touch icons + webmanifest
├── social/           ← avatar IG, post template, story
├── icons/            ← 20 UI icons (stroke, currentColor)
├── backgrounds/      ← 4 background patterns (SVG full-bleed)
├── badges/           ← 4 level badges (Apprentice → Forgemaster)
└── tokens/           ← CSS variables: colors, typography
```

## Cara pakai cepat (HTML)

```html
<head>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.svg">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">

  <link rel="stylesheet" href="/assets/tokens/tokens.css">
</head>

<body class="hf-bg-atmosphere">
  <header>
    <img src="/assets/logo/logo-horizontal-dark.svg" alt="Habit Forge" height="48">
  </header>

  <button style="background:var(--hf-indigo-500);color:#fff">Tempa kebiasaan</button>
</body>
```

## Cara pakai icon (React / Vue / vanilla)

Semua icon pakai `stroke="currentColor"` — warna mengikuti CSS `color`.

```html
<span style="color: var(--hf-indigo-300)">
  <img src="/assets/icons/beranda.svg" width="24" height="24" alt="Beranda">
</span>
```

Atau inline kalau perlu fill warna spesifik:

```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a9ef"
     stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 11l9-7 9 7"/><path d="M5 10v10h6v-6h2v6h6V10"/>
</svg>
```

## Palet warna inti

| Token            | Hex     | Fungsi                         |
|------------------|---------|--------------------------------|
| --hf-ink-900     | #0B0F1A | Page background                |
| --hf-ink-700     | #1B2236 | Card surface                   |
| --hf-ink-600     | #252E47 | Border / divider               |
| --hf-ink-300     | #8893B3 | Muted text                     |
| --hf-ink-100     | #E6E9F5 | High-contrast text             |
| --hf-indigo-500  | #6B6DDF | Primary brand                  |
| --hf-ember-500   | #C9824A | Accent (forge heat)            |
| --hf-success     | #5FB98A | Selesai / streak hari ini      |

## Tipografi

- **Sora** — display & body (Google Fonts, weights 300–800).
- **JetBrains Mono** — label teknis, mono caption, kode.

`@import` sudah disiapkan di `tokens/typography.css`.

## Background patterns

Pakai class CSS dari `tokens.css`:

- `.hf-bg-forge-grid` — untuk halaman login / register
- `.hf-bg-spark-field` — untuk landing / hero marketing
- `.hf-bg-atmosphere` — untuk dashboard / app interior

Atau pakai versi SVG di `assets/backgrounds/` sebagai `background-image`.

## Icon naming (Bahasa Indonesia)

`beranda, daftar-tugas, kebiasaan, kalender, statistik, pencapaian,
pengaturan, keluar, streak, tambah, notifikasi, profil, search, edit,
hapus, centang, panah-kanan, panah-kiri, bulan, matahari`

## Lisensi

© 2026 Sutanology. Internal brand asset — bebas dipakai untuk
pengembangan aplikasi Habit Forge.
