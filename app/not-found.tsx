export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0d] px-6 text-white">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <p className="text-2xl font-semibold">404 - Halaman tidak ditemukan</p>
        <p className="mt-3 text-sm text-white/60">
          Link yang kamu cari tidak tersedia. Silakan kembali ke halaman utama.
        </p>
      </div>
    </main>
  );
}
