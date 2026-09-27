"use client";

export default function LegacyPortfolio({ html }) {
  // Markup ini adalah hasil ekstraksi 1:1 dari index.html asli (cuma gambar
  // base64-nya dipindah jadi file di /public/images). Dirender lewat
  // dangerouslySetInnerHTML supaya struktur DOM (id, class) persis sama
  // dengan aslinya — karena semua script animasi (Three.js, custom cursor,
  // kinetic text, gallery Firebase) cari elemen lewat getElementById /
  // querySelector, bukan lewat React state. Ini yang bikin "port apa
  // adanya" aman: dari sisi browser, DOM-nya identik dengan versi lama.
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
