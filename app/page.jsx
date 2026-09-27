import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import LegacyPortfolio from "@/components/LegacyPortfolio";

export default function HomePage() {
  const htmlPath = path.join(process.cwd(), "lib", "legacy-body.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  return (
    <>
      <LegacyPortfolio html={html} />

      {/* Semua <script> inline dari index.html asli (cursor, progress bar,
          Three.js background, kinetic text, transisi, dan gallery Firebase
          "owner mode") digabung jadi satu file supaya urutan eksekusinya
          tetap sama persis kayak versi HTML lama. Dimuat "afterInteractive"
          karena butuh THREE & firebase yang sudah dimuat lebih dulu di
          layout.jsx. */}
      <Script src="/legacy-inline.js" strategy="afterInteractive" />
    </>
  );
}
