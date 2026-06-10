# ScaleGram - Product Requirements Document (PRD)

## 1. Deskripsi Produk

ScaleGram merupakan aplikasi media sosial berbasis mobile yang dikembangkan menggunakan React Native dan Expo. Aplikasi ini memungkinkan pengguna untuk membuat dan membagikan postingan berupa gambar dan caption, memberikan like dan komentar, mengikuti pengguna lain, serta mencari pengguna maupun konten tertentu.

Selain menyediakan fitur media sosial pada umumnya, ScaleGram dirancang dengan fokus pada penerapan Clean Architecture, optimasi performa, dan kemampuan aplikasi untuk tetap berjalan ketika perangkat tidak terhubung dengan internet. Pendekatan tersebut dipilih agar aplikasi lebih mudah dikembangkan, dipelihara, dan mampu menangani pertumbuhan data serta pengguna di masa mendatang.

---

## 2. Tujuan Pengembangan

Tujuan dari pengembangan aplikasi ScaleGram adalah sebagai berikut:

* Membangun aplikasi media sosial berbasis mobile menggunakan React Native dan Expo.
* Menerapkan konsep Clean Architecture pada proses pengembangan aplikasi.
* Mengoptimalkan performa aplikasi dalam menampilkan data dan mengelola sumber daya perangkat.
* Menerapkan mekanisme penyimpanan data lokal untuk mendukung penggunaan secara offline.
* Mengimplementasikan pengujian aplikasi guna memastikan kualitas perangkat lunak yang dikembangkan.

---

## 3. Target Pengguna

Target pengguna aplikasi ScaleGram meliputi:

* Mahasiswa dan pelajar.
* Pengguna media sosial umum.
* Pengguna yang memiliki keterbatasan koneksi internet.
* Pengguna yang ingin berbagi informasi dalam bentuk gambar dan teks.

---

## 4. Fitur Utama

### 4.1 Authentication

Fitur autentikasi digunakan untuk mengelola proses masuk dan keluar pengguna dari sistem.

**Fitur yang tersedia:**

* Registrasi akun menggunakan email dan password.
* Login menggunakan email dan password.
* Login menggunakan akun Google.
* Logout.
* Pengelolaan profil pengguna.

### 4.2 Feed

Fitur feed digunakan untuk menampilkan daftar postingan yang dibuat oleh pengguna.

**Fitur yang tersedia:**

* Menampilkan daftar postingan.
* Infinite scrolling.
* Refresh data.
* Menampilkan data yang tersimpan di cache saat offline.

### 4.3 Post Management

Fitur ini digunakan untuk mengelola postingan yang dibuat oleh pengguna.

**Fitur yang tersedia:**

* Membuat postingan.
* Mengunggah gambar.
* Menambahkan caption.
* Mengubah postingan.
* Menghapus postingan.

### 4.4 Social Interaction

Fitur interaksi sosial memungkinkan pengguna berinteraksi dengan pengguna lainnya.

**Fitur yang tersedia:**

* Like postingan.
* Komentar postingan.
* Follow pengguna.
* Unfollow pengguna.

### 4.5 Search and Discovery

Fitur pencarian digunakan untuk membantu pengguna menemukan akun maupun konten tertentu.

**Fitur yang tersedia:**

* Pencarian pengguna.
* Pencarian postingan.

### 4.6 Notification

Fitur notifikasi digunakan untuk memberikan informasi kepada pengguna mengenai aktivitas tertentu dalam aplikasi.

**Fitur yang tersedia:**

* Local Notification.
* Firebase Cloud Messaging (FCM).

### 4.7 Theme Management

Fitur ini memungkinkan pengguna mengganti tampilan aplikasi sesuai preferensi.

**Fitur yang tersedia:**

* Light Mode.
* Dark Mode.

---

## 5. Fitur Unggulan

### Optimized Offline Feed with Smart Caching

Fitur unggulan yang diimplementasikan pada ScaleGram adalah mekanisme penyimpanan data feed ke dalam basis data lokal menggunakan SQLite. Data yang sebelumnya berhasil diperoleh dari Firebase Firestore akan disimpan ke perangkat sehingga dapat ditampilkan kembali ketika koneksi internet tidak tersedia.

Ketika perangkat kembali terhubung ke internet, aplikasi akan melakukan sinkronisasi dan memperbarui data yang ada pada cache lokal. Dengan pendekatan tersebut, pengguna tetap dapat mengakses feed tanpa harus selalu bergantung pada koneksi jaringan.

### Implementasi

* Data feed disimpan ke SQLite.
* Data diambil dari cache ketika perangkat offline.
* Sinkronisasi otomatis ketika koneksi internet tersedia.
* Menampilkan indikator status online dan offline.
* Mendukung image caching untuk meningkatkan kecepatan akses data.

### Manfaat

* Mempercepat waktu pemuatan data.
* Mengurangi ketergantungan terhadap koneksi internet.
* Meningkatkan pengalaman pengguna.
* Mendukung konsep aplikasi yang scalable dan efisien.

---

## 6. Arsitektur Sistem

ScaleGram menerapkan Clean Architecture dengan pembagian lapisan sebagai berikut:

### Presentation Layer

Lapisan yang bertanggung jawab untuk menampilkan antarmuka pengguna dan menerima interaksi dari pengguna.

### Domain Layer

Lapisan yang berisi aturan bisnis dan use case utama aplikasi.

### Data Layer

Lapisan yang bertanggung jawab dalam pengelolaan data dari Firebase maupun penyimpanan lokal.

---

## 8. Optimasi Performa

Beberapa teknik optimasi performa yang digunakan pada aplikasi ScaleGram meliputi:

### Feed Optimization

* FlatList dengan konfigurasi yang dioptimalkan.
* getItemLayout.
* windowSize.
* maxToRenderPerBatch.

### Rendering Optimization

* React.memo.
* useMemo.
* useCallback.

### Image Optimization

* expo-image.
* Image caching.
* Image preloading.

### State Management Optimization

* Zustand.
* Memoized selectors.

---

## 9. Strategi Offline-First

### Local Cache

* Penyimpanan data menggunakan SQLite.
* Menampilkan data yang tersimpan saat offline.
* Sinkronisasi data ketika perangkat kembali online.

### Optimistic UI

* Like langsung ditampilkan pada antarmuka sebelum konfirmasi server.
* Komentar langsung ditampilkan pada antarmuka sebelum konfirmasi server.

### Conflict Resolution

* Validasi data terhadap server.
* Pembaruan cache secara otomatis setelah sinkronisasi berhasil.

---

## 10. Teknologi yang Digunakan

### Frontend

* React Native
* Expo
* React Navigation v6

### State Management

* Zustand

### Backend

* Firebase Authentication
* Firebase Firestore
* Firebase Storage

### Local Storage

* Expo SQLite

### Animation and Gesture

* React Native Reanimated 2
* React Native Gesture Handler

### Testing

* Jest
* React Native Testing Library

### Code Quality

* ESLint
* Prettier