import Script from "next/script";
import "./globals.css";

const FAVICON =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%23080a0f%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2227%22%20fill%3D%22%235b2a78%22%20stroke%3D%22%23d9a7ff%22%20stroke-width%3D%222%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%23c98cff%22%20stroke-width%3D%223%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23e0b5ff%22%20stroke-width%3D%223%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%224.5%22%20fill%3D%22%23160b22%22%20stroke%3D%22%23f0d5ff%22%20stroke-width%3D%222%22%2F%3E%3Cg%20fill%3D%22%2312081a%22%3E%3Cpath%20d%3D%22M32%208c3%205%203%209%200%2013-3-4-3-8%200-13Z%22%2F%3E%3Cpath%20d%3D%22M56%2032c-5%203-9%203-13%200%204-3%208-3%2013%200Z%22%2F%3E%3Cpath%20d%3D%22M32%2056c-3-5-3-9%200-13%203%204%203%208%200%2013Z%22%2F%3E%3Cpath%20d%3D%22M8%2032c5-3%209-3%2013%200-4%203-8%203-13%200Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";

export const metadata = {
  title: "Irwan Khoirul Faiz — Operations & Logistics Automation",
  description:
    "Logistics Operations Leader, Freelance Web Developer, and Process Automation Specialist building smarter operational systems.",
  icons: {
    icon: FAVICON,
    apple: FAVICON,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Library global (bukan npm module) — sama persis kayak di HTML asli.
            Wajib "beforeInteractive" supaya THREE & firebase udah tersedia
            sebelum script gabungan di page.jsx (legacy-inline.js) jalan. */}
        <Script
          src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
