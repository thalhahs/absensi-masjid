/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Izinkan akses dev dari HP/tablet di jaringan lokal (hot reload)
  allowedDevOrigins: ['192.168.18.20', '192.168.18.4', '127.0.2.2'],
};

export default nextConfig;
