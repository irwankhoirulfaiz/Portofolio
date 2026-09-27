# Irwan Khoirul Faiz — Portofolio (Next.js)

Port dari `index.html` (satu file besar berisi HTML+CSS+JS+gambar base64)
ke struktur Next.js, dengan animasi (Three.js background, custom cursor,
kinetic text, hero 3D tilt) dan fitur gallery "Owner Mode" (Firebase)
dipertahankan **persis seperti aslinya** — bukan ditulis ulang.

## Kenapa strukturnya begini (baca ini dulu sebelum bingung)

Portofolio lu ini beda jauh sama website AUM kemarin — bukan cuma
landing page biasa, tapi punya animasi custom yang berat (WebGL shader,
custom cursor, dll) yang caranya kerja itu langsung "nyari" elemen HTML
lewat `id`/`class` (bukan pakai React state). Kalau semua itu ditulis
ulang jadi React murni (`useState`, `useEffect` per animasi), risikonya
gede — bisa aja ada animasi yang jalannya beda dikit dari aslinya.

Karena kemarin lu milih **"pertahanin semua, port apa adanya"**, gua
pakai strategi yang lebih aman:

1. Markup asli (HTML) & semua CSS dipindah **apa adanya** ke Next.js.
2. Semua `<script>` asli digabung jadi satu file (`public/legacy-inline.js`)
   dan dijalankan **setelah** komponen React ke-render — jadi script itu
   nyari elemen yang strukturnya 100% sama kayak versi lama, animasinya
   otomatis jalan identik.
3. Gambar yang tadinya di-embed sebagai base64 raksasa (bikin file HTML-nya
   2 MB!) sekarang jadi file gambar normal di `public/images/`, biar lebih
   ringan & gampang diganti.

Konsekuensinya: struktur project ini gak "React idiomatic" banget (gak ada
komponen `<Hero />`, `<Projects />` terpisah) — tapi ini pilihan yang tepat
untuk **mempertahankan seluruh animasi custom lu 1:1**, sesuai yang lu mau.
Kalau nanti lu udah lebih jago React dan mau refactor pelan-pelan jadi
komponen-komponen kecil, project ini bisa jadi titik awal yang aman karena
semuanya udah jalan duluan.

## Struktur

```
app/
  layout.jsx        → load CSS global + Three.js & Firebase (CDN, sebelum interaktif)
  page.jsx           → baca lib/legacy-body.html, render, lalu jalankan legacy-inline.js
  globals.css        → SEMUA css asli (gabungan banyak <style> tag di file lama)
components/
  LegacyPortfolio.jsx → render markup asli lewat dangerouslySetInnerHTML
lib/
  legacy-body.html    → markup body asli (header, hero, about, journey, projects, dst)
public/
  legacy-inline.js     → semua <script> inline asli, digabung urut
  images/               → 12 gambar yang tadinya base64, sekarang file asli:
                           hero-portrait.png, project-soc-control-tower.jpg,
                           project-es-teh-kito.jpg, project-wedding-planner.jpg,
                           + 8 screenshot SOC Control Tower
```

## 1. Jalanin di StackBlitz (tanpa install apa pun)

Sama kayak project AUM kemarin:
1. Push folder ini ke GitHub, lalu import repo-nya di https://stackblitz.com
2. StackBlitz otomatis `npm install` + `next dev`, preview muncul otomatis.

## 2. Firebase — udah connect ke project asli lu

File `public/legacy-inline.js` masih pakai config Firebase yang sama persis
kayak yang ada di `index.html` lama (project `portofolio-67d77`), jadi:
- Fitur "Owner Mode" (tombol ⌕ Owner di tiap galeri project) tetap connect
  ke database yang sama — foto yang udah lu upload sebelumnya tetap muncul.
- Login owner tetap pakai email/password yang sama kayak sebelumnya.

Gak perlu setup Firebase ulang. Kalau suatu saat lu mau pindah ke project
Firebase baru, tinggal cari bagian `firebaseConfig` di
`public/legacy-inline.js` dan ganti value-nya.

## 3. CV & foto

- File `Irwan_Khoirul_Faiz_ATS_CV.pdf` yang di-link tombol "Download CV"
  belum ikut ke-zip (bukan bagian dari `index.html`). Taruh file CV asli
  lu di folder `public/` dengan nama persis sama biar tombolnya jalan.
- 12 gambar yang gua ekstrak dari `index.html` lama udah ada di
  `public/images/` — tinggal diganti file-nya kalau mau update foto,
  gak perlu edit kode sama sekali (nama filenya udah gua kasih tau jelas
  di bagian struktur di atas).

## 4. Deploy ke Vercel

Sama kayak README AUM kemarin: push ke GitHub → import di vercel.com →
Deploy. Gak ada environment variable yang perlu diisi manual di sini
(beda sama project AUM), karena Firebase config-nya masih hardcoded di
`legacy-inline.js` (poin 2 di atas).

## 5. Soal "CMS" yang lu mau

Portofolio ini sebenernya **udah punya CMS kecil** dari dulu: tombol
"⌕ Owner" di tiap galeri project (SOC Control Tower, Es Teh Kito, Wedding
Planner) — kalau login, lu bisa tambah/hapus **foto** di galeri tanpa
sentuh kode. Itu udah ke-port dan tetap jalan di versi Next.js ini.

Yang **belum** bisa diedit tanpa kode: kartu project itu sendiri (judul,
deskripsi singkat, cover) — itu masih hardcoded di `lib/legacy-body.html`,
karena baru ada 3 project dan nambah project baru butuh markup baru juga
(bukan cuma data). Kalau ke depannya lu emang mau bisa nambah project ke-4,
ke-5, dst tanpa edit kode sama sekali, itu bisa gua bikinin — caranya mirip
project AUM kemarin (data project dipindah ke Firestore/Firebase, terus
"Owner Mode"-nya diperluas buat bisa nambah project baru, bukan cuma foto).
Bilang aja kalau itu yang lu mau langkah selanjutnya.
