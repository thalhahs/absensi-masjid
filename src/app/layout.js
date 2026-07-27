import "./globals.css";

export const metadata = {
  title: "Absensi Petugas Masjid",
  description: "Aplikasi Presensi Petugas Masjid Modern & Minimalis",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#022c22",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
