# 🍲 Aplikasi Web: Masakan Tetangga

## 📖 Gambaran & Konsep Aplikasi

"Masakan Tetangga" adalah platform web berbasis lokasi (_hyper-local_) yang dirancang untuk mengurangi _food waste_ sekaligus memudahkan akses makanan rumahan bagi pekerja atau individu yang sibuk. Konsep utamanya adalah mendeteksi dan menampilkan masakan berlebih yang dibagikan atau dijual oleh tetangga dalam radius tertentu yang dapat diatur oleh pengguna. Penjual dapat memposting masakan dengan batas waktu ketersediaan, sementara pembeli dapat menjelajah melalui peta interaktif, melakukan pemesanan, dan berkomunikasi secara _real-time_ untuk koordinasi penjemputan. Aplikasi ini mengutamakan kepercayaan, kecepatan, dan efisiensi logistik lokal tanpa perlu kurir pihak ketiga.

## 🛠️ Teknologi yang Digunakan

**Frontend**

- Framework: React + Vite + TypeScript
- UI & Styling: Tailwind CSS + shadcn/ui
- Peta & Geolokasi: React-Leaflet (OpenStreetMap)
- State & Data: TanStack Query, Zustand
- Form & Validasi: React Hook Form + Zod
- Kompresi Gambar: `browser-image-compression`

**Backend**

- Framework: Express.js + TypeScript
- Real-time: Socket.io
- File Handling: Multer (`memoryStorage`)
- Validasi: Zod (shared dengan frontend)

**Database & Autentikasi**

- Database: Neon PostgreSQL (dengan ekstensi **PostGIS**)
- ORM: Drizzle ORM
- Auth: Better Auth (JWT & Session Management)

**Infrastruktur & Deployment**

- Hosting: Vercel (Frontend), Railway / Render / Fly.io (Backend & DB)

## 📅 Penjabaran Fase Pengembangan

### Fase 1: Fondasi Proyek & Autentikasi

Inisialisasi repositori untuk frontend React Vite dan backend Express, konfigurasi koneksi database Neon menggunakan Drizzle ORM, serta implementasi sistem autentikasi penuh menggunakan Better Auth untuk menangani registrasi, login, manajemen sesi, dan proteksi rute dasar.
**Target Pengujian:**

- Koneksi ke database Neon berhasil dan migrasi schema awal berjalan tanpa error.
- User dapat melakukan registrasi, login, dan logout dengan mulus.
- Middleware proteksi rute di backend berhasil menolak akses API jika tidak ada token valid.

### Fase 2: Manajemen Data Masakan & Geolokasi

Pembuatan skema database untuk entitas Masakan yang terintegrasi dengan ekstensi PostGIS untuk menyimpan koordinat titik lokasi penjual, serta pengembangan API backend untuk membuat, membaca, memperbarui, dan menghapus (CRUD) postingan masakan beserta validasi datanya.
**Target Pengujian:**

- API berhasil menyimpan dan mengambil data masakan beserta koordinat latitude/longitude.
- Query PostGIS berhasil memfilter masakan berdasarkan radius jarak tertentu dari titik pusat.
- Validasi input Zod di backend menolak data masakan yang tidak lengkap atau format koordinat yang salah.

### Fase 3: Penemuan Berbasis Peta (Map Discovery)

Integrasi peta interaktif menggunakan React-Leaflet di frontend untuk menampilkan pin lokasi masakan, lengkap dengan fitur pengaturan radius pencarian oleh user, pengambilan lokasi otomatis, dan tampilan list masakan terdekat di sekitar area peta.
**Target Pengujian:**

- Peta berhasil merender dan menampilkan pin masakan sesuai data dari backend.
- Slider/pengaturan radius berfungsi mengubah area pencarian dan memperbarui daftar masakan secara dinamis.
- Geolokasi browser berhasil mengambil koordinat awal user dan meminta izin lokasi dengan benar.

### Fase 4: Optimasi & Penyimpanan Gambar (BLOB)

Implementasi alur unggah foto makanan di mana gambar dikompresi di frontend menggunakan `browser-image-compression` agar maksimal 300KB, dikirim via Multer ke backend, dan disimpan langsung sebagai tipe data `bytea` (BLOB) di dalam database Neon.
**Target Pengujian:**

- Gambar yang diunggah otomatis terkompresi di browser menjadi di bawah 300KB sebelum dikirim ke server.
- Backend berhasil menerima buffer gambar via Multer memory storage dan menyimpannya ke kolom `bytea`.
- Frontend berhasil merender data BLOB dari database kembali menjadi tampilan visual gambar yang utuh dan cepat.

### Fase 5: Notifikasi Real-time & Status Ketersediaan

Integrasi Socket.io untuk memberikan notifikasi real-time kepada pembeli ketika ada masakan baru yang diposting dalam radius mereka, serta penambahan logika status ketersediaan masakan (tersedia, dipesan, habis) yang diperbarui secara langsung di semua klien.
**Target Pengujian:**

- Notifikasi pop-up muncul di frontend pembeli saat ada postingan baru yang masuk dalam radiusnya.
- Status masakan berubah secara real-time di layar semua user saat penjual memperbarui ketersediaannya.
- Koneksi Socket.io tetap stabil dan mampu melakukan _reconnect_ otomatis jika terjadi putus jaringan sementara.

### Fase 6: Sistem Pemesanan & Komunikasi (Chat)

Pembuatan fitur reservasi atau pemesanan masakan oleh pembeli untuk mengunci stok, dilengkapi dengan fitur live chat sederhana berbasis Socket.io antara pembeli dan penjual untuk koordinasi waktu, lokasi penjemputan, dan konfirmasi transaksi.
**Target Pengujian:**

- Pembeli berhasil melakukan booking dan status masakan otomatis berubah menjadi "dipesan".
- Sistem mencegah penjual atau pembeli lain memesan masakan yang sama (mencegah _double booking_).
- Pesan chat terkirim dan diterima secara real-time antara dua user yang sedang bertransaksi.

### Fase 7: Sistem Reputasi & Profil Tetangga

Pengembangan halaman profil user yang menampilkan riwayat transaksi dan masakan yang pernah dijual, serta implementasi sistem rating dan ulasan pasca-transaksi untuk membangun kepercayaan dan memberikan badge "Tetangga Terpercaya" bagi penjual dengan rating tinggi.
**Target Pengujian:**

- Pembeli bisa memberikan bintang dan ulasan setelah pesanan selesai diambil.
- Rating rata-rata penjual terhitung dan tampil akurat di profil serta pada pin di peta.
- Badge "Tetangga Terpercaya" otomatis muncul di profil jika rating penjual melewati batas threshold yang ditentukan.

### Fase 8: Pembersihan, Otomatisasi & Deployment

Penambahan Cron Job untuk otomatis menghapus atau mengarsipkan postingan masakan yang sudah kedaluwarsa waktunya, penyempurnaan UI/UX untuk tampilan mobile, penanganan error global, serta proses deployment frontend ke Vercel dan backend ke Railway atau Fly.io.
**Target Pengujian:**

- Postingan masakan otomatis hilang dari peta dan database setelah batas waktu kedaluwarsa berlalu.
- Aplikasi tampil responsif, rapi, dan fungsional penuh pada berbagai ukuran layar smartphone.
- Aplikasi frontend dan backend berjalan stabil di environment production tanpa error CORS atau koneksi database.
