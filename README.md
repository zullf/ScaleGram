# ScaleGram - Social Media App (Kelompok 4)

[![CI Pipeline](https://github.com/zullf/ScaleGram/actions/workflows/test.yml/badge.svg)](https://github.com/zullf/ScaleGram/actions)

Tugas Besar Pemrograman Mobile Lanjut - D3 Sistem Informasi, Universitas Pembangunan Nasional Veteran Jakarta.

## Informasi Mahasiswa (Kelompok 4)

- Ketua : Zulfikar Hasan 2410501016
- Anggota 1 : Muhammad Prayogo Pangestu 2410501046
- Anggota 2 : Aditya Aryobima 2410501002
- Anggota 3 : Fatir Riva Sadewo 2410501008

Fokus Eksplorasi: Architecture, Performance & Scalability

## Deskripsi Aplikasi

ScaleGram adalah aplikasi media sosial berbasis React Native dan Expo yang dirancang khusus dengan fokus pada arsitektur kode yang bersih, manajemen memori tingkat lanjut, serta skalabilitas performa tinggi untuk menangani data berskala besar.

Aplikasi ini mengimplementasikan pemisahan lapisan logika Clean Architecture untuk menjamin bahwa aplikasi tetap responsif, hemat penggunaan data, dan andal dalam kondisi jaringan buruk.

## Fitur Utama & Keunggulan Wajib (Kelompok 4)

### 1. Clean Architecture Implementation

- **Layered Architecture:** Pembagian struktur kode yang tegas ke dalam 3 lapisan utama: `Presentation` ke `Domain` ke `Data`.
- **Repository Pattern:** Enkapsulasi penuh untuk semua akses data (Firebase Firestore, SQLite lokal, dan AsyncStorage).
- **API Abstraction Layer:** Semua network request diisolasi melalui satu pintu abstraksi tunggal untuk menjaga kemandirian modul kodingan.
- **Custom Hooks & Error Boundary:** Pemanfaatan hooks seperti `useGetFeed()` dan `useCreatePost()` sebagai representasi _use-cases_, dilengkapi _Error Boundary_ di setiap screen untuk penanganan eror yang ramah (_graceful error handling_).

### 2. Performance Optimization

- **FlatList Optimization:** Implementasi `getItemLayout`, `windowSize`, dan `maxToRenderPerBatch` untuk menangani _infinite scroll feed_ tanpa lag.
- **Virtualized Rendering:** Hanya merender komponen visual yang sedang terlihat di layar (_viewport_).
- **Image Caching & Preloading:** Menggunakan `expo-image` untuk cache gambar otomatis dan melakukan _preloading_ konten sebelum muncul ke layar.

### 3. Offline-First Architecture

- **Local Caching (SQLite):** Semua data feed disimpan di database lokal menggunakan `expo-sqlite` sehingga feed tetap tampil memukau saat offline.
- **Optimistic UI:** Aksi interaksi sosial (seperti _Like_ dan _Comment_) langsung diaplikasikan pada UI sebelum mendapat konfirmasi sukses dari server Firebase.
- **Background Sync:** Data yang dibuat pengguna saat kondisi offline akan otomatis disinkronisasikan secara mandiri begitu koneksi kembali pulih.

### 4. Testing Suite & CI Pipeline (Bonus Poin)

- **Unit Testing dengan Jest:** Memiliki cakupan pengujian (_coverage rate_) $\ge50\%$ untuk menjamin keamanan business logic.
- **Performance & Component Test:** Mengukur waktu render visual secara ketat pada `FeedScreen` dengan pengujian render terisolasi 50 items sekaligus.
- **CI Pipeline via GitHub Actions:** Menjalankan rangkaian testing otomatis secara instan setiap kali anggota kelompok melakukan _push_ ke branch utama.

## Tech Stack

- **Framework & Core:** React Native (0.85.3), Expo (v56.0.11), React Navigation v7 (Stack, Tab, Drawer)
- **Backend & Data Services:** Firebase Authentication (Email/Password & Google Sign-In), Firebase Firestore (Primary DB), Firebase Storage (Media Upload)
- **Local Persistence:** Expo SQLite & AsyncStorage
- **State Management:** Zustand (v5.0.14)
- **UI/UX & Animation:** React Native Reanimated & Gesture Handler

## Architecture & Folder Structure

Aplikasi **ScaleGram** dibangun menggunakan **Layered Clean Architecture** yang memisahkan kode ke dalam 3 lapisan utama (_Presentation, Domain, & Data_) untuk menjaga kode tetap modular, mudah diuji (_testable_), dan independen.

```text
src/
├─ app/                 # Dependency Injection & Application Providers (Perekat Layer)
├─ config/              # Konfigurasi Pihak Ketiga (Firebase SDK Environment)
├─ data/                # DATA LAYER: Implementasi Database & API
│  ├─ datasources/      # Remote (Firebase) & Local (SQLite, AsyncStorage)
│  ├─ mappers/          # Transformasi data dari Database ke Objek Domain
│  └─ repositories/     # Realisasi logika penyimpanan data
├─ domain/              # DOMAIN LAYER: Aturan Bisnis Inti (Bebas dari Library Luar)
│  ├─ entities/         # Objek data inti (Blueprints)
│  ├─ repositories/     # Kontrak / Interface abstraksi data
│  └─ usecases/         # Logika skenario aplikasi (Sync, Auth, Social, Post)
├─ presentation/        # PRESENTATION LAYER: Komponen Antarmuka Pengguna (UI)
│  ├─ components/       # Reusable UI Components
│  ├─ screens/          # Layar Aplikasi (Login, Feed, dll)
│  └─ navigation/       # Pengatur Jalur Navigasi Aplikasi
├─ store/               # State Management Global (Zustand)
└─ utils/               # Fungsi Pembantu / Helper (Format Waktu, Validasi)
```

## Screenshot Aplikasi

### Feed
<img width="220" alt="WhatsApp Image 2026-06-24 at 07 16 12" src="https://github.com/user-attachments/assets/15d141bd-823a-4467-8792-ef5b9dd2ac1f" />

### Explore
<img width="220" alt="WhatsApp Image 2026-06-24 at 07 14 53 (1)" src="https://github.com/user-attachments/assets/5a835876-2d6b-4424-8218-cdb123070d94" />

### Create Post
<img width="220" alt="WhatsApp Image 2026-06-24 at 07 14 52" src="https://github.com/user-attachments/assets/746f6d4d-72d8-4149-aefa-4bcc5a222056" />

### Activity
<img width="220" alt="WhatsApp Image 2026-06-24 at 07 14 51" src="https://github.com/user-attachments/assets/a72ef6ab-e664-432a-bca1-ea00f6efc4d6" />

### Profile
<img width="220" alt="WhatsApp Image 2026-06-24 at 07 14 51 (1)" src="https://github.com/user-attachments/assets/8bfc9191-c3a2-4870-b7da-3df3c90bb371" />

### Offline center
<img width="220" alt="WhatsApp Image 2026-06-24 at 07 14 34" src="https://github.com/user-attachments/assets/50776686-6b08-4631-b5c4-7f9aec0ea93e" />

## Cara Menjalankan

1.  **Clone Project**

```

    git clone [https://github.com/zullf/ScaleGram.git](https://github.com/zullf/ScaleGram.git)

    cd ScaleGram

```

2.  **Install Dependencies**

```
    npm install
```

3.  **Menjalankan Automated Unit Test**
    Ketik perintah ini untuk memverifikasi ke-33 skenarios testing dan melihat laporan coverage logic:

```
    npm run test
```

4.  **Menjalankan Aplikasi**

```
    npx expo start
```

Pindai kode QR menggunakan aplikasi Expo Go di ponsel fisik Anda untuk memulai pengujian.
