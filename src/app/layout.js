import "./globals.css";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "Absensi Petugas Masjid",
  description: "Aplikasi Presensi Petugas Masjid Modern & Minimalis",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#7D5A41",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className={`antialiased ${inter.className}`}>{children}</body>
    </html>
  );
}
