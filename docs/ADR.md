# Architecture Decision Record - ScaleGram

Dokumen ini berisi keputusan arsitektur utama pada project ScaleGram beserta alasan dan trade-off-nya. Format dibuat sederhana agar mudah dipakai untuk laporan, presentasi, atau tanya jawab dengan dosen.

## ADR-001 - Menggunakan Clean Architecture Berlapis

**Status:** Accepted

**Konteks:** ScaleGram memiliki banyak fitur seperti authentication, feed, upload post, like, comment, follow, notification, theme, dan offline sync. Jika semua logic diletakkan langsung di screen, kode akan sulit dirawat.

**Keputusan:** Project dipisahkan menjadi beberapa lapisan:

- `src/presentation` untuk UI, screen, component, hook, theme, dan navigation.
- `src/domain` untuk use case dan kontrak repository.
- `src/data` untuk implementasi repository, data source Firebase, SQLite, AsyncStorage, dan mapper.
- `src/store` untuk global state client.
- `src/app` untuk provider dan dependency setup.

**Alasan:** Pemisahan ini membuat UI tidak langsung bergantung pada detail database. Perubahan pada Firebase, SQLite, atau upload media dapat dilakukan di data layer tanpa harus mengubah banyak screen.

**Konsekuensi:** Struktur folder menjadi lebih banyak dan perlu disiplin import. Untuk project kecil, pendekatan ini terasa lebih panjang, tetapi lebih aman untuk fitur social media yang terus berkembang.

---

## ADR-002 - Menggunakan Repository Pattern untuk Data Access

**Status:** Accepted

**Konteks:** Aplikasi mengakses beberapa sumber data: Firebase Auth, Firestore, Google Apps Script/Drive untuk media, SQLite untuk cache, dan AsyncStorage untuk session/theme.

**Keputusan:** Akses data dikumpulkan melalui repository seperti `postRepositoryImpl`, `userRepositoryImpl`, `socialRepositoryImpl`, `notificationRepositoryImpl`, `authRepositoryImpl`, dan `queueRepositoryImpl`.

**Alasan:** Repository menjadi satu pintu untuk operasi data. Screen cukup memanggil use case atau hook, sementara detail query Firestore, batch write, transaction, cache, dan queue disembunyikan di data layer.

**Trade-off:** Beberapa use case saat ini masih mengimpor repository implementasi secara langsung. Ini sudah membantu pemisahan kode, tetapi belum sepenuhnya ideal karena domain layer masih mengetahui implementasi data layer pada beberapa bagian.

**Konsekuensi:** Testing lebih mudah dilakukan pada repository/use case tertentu, tetapi perlu konsistensi agar semua fitur baru mengikuti pola yang sama.

---

## ADR-003 - Menggunakan Dependency Injection Sederhana dengan React Context

**Status:** Accepted

**Konteks:** Aplikasi membutuhkan objek dependency seperti Firebase, repository, SQLite, dan local storage. Jika dibuat langsung di setiap screen, akan terjadi duplikasi dan coupling tinggi.

**Keputusan:** Dependency utama dibuat di `DependencyProvider` dan dibagikan melalui `useDependencies`.

**Alasan:** Pendekatan ini sederhana, cocok untuk React Native, dan tidak membutuhkan framework dependency injection tambahan. Dependency dapat dibuat sekali lalu dipakai oleh presentation hook seperti `useFeed`.

**Trade-off:** Tidak semua module saat ini sudah memakai `DependencyProvider`; beberapa use case masih memakai import langsung. Namun fondasi DI sudah tersedia untuk pengembangan lanjutan.

**Konsekuensi:** Project lebih mudah diarahkan ke arsitektur yang testable, tetapi perlu refactor bertahap agar semua use case menerima dependency dari provider.

---

## ADR-004 - Menggunakan Zustand untuk State Management

**Status:** Accepted

**Konteks:** Aplikasi membutuhkan state global untuk autentikasi dan theme. State tersebut dipakai lintas screen dan navigation.

**Keputusan:** Menggunakan Zustand melalui `authStore`, `themeStore`, dan `networkStore`.

**Alasan:** Zustand ringan, API sederhana, dan cocok untuk state global yang tidak terlalu kompleks. Auth state juga dipersist memakai AsyncStorage agar session tetap tersedia setelah aplikasi dibuka ulang.

**Trade-off:** Zustand lebih fleksibel dibanding Redux, tetapi tidak memberi struktur seketat Redux Toolkit. Tim harus menjaga naming action dan selector tetap konsisten.

**Konsekuensi:** Boilerplate lebih sedikit, performa cukup baik, dan screen dapat membaca state secara langsung melalui selector.

---

## ADR-005 - Firebase sebagai Backend Utama

**Status:** Accepted

**Konteks:** Social media app membutuhkan authentication, database realtime-ish, dan penyimpanan data yang mudah diintegrasikan dengan React Native.

**Keputusan:** Firebase digunakan untuk:

- Firebase Authentication untuk email/password dan Google Sign-In.
- Firestore untuk data user, post metadata, comment, notification, follower, dan following.
- Firebase config sebagai pusat koneksi backend.

**Alasan:** Firebase mempercepat pengembangan MVP, menyediakan SDK yang matang, dan cocok untuk kebutuhan tugas besar yang membutuhkan CRUD, authentication, dan integrasi mobile.

**Trade-off:** Query Firestore perlu dirancang sesuai batasan index dan struktur collection. Beberapa operasi seperti follow/unfollow membutuhkan batch write agar data konsisten.

**Konsekuensi:** Development lebih cepat, tetapi aplikasi menjadi cukup bergantung pada model data Firebase.

---

## ADR-006 - Upload Media melalui Google Apps Script/Drive

**Status:** Accepted

**Konteks:** Pada backend terjadi trade-off dari upload media langsung ke Firebase Storage menjadi upload melalui Google Apps Script yang menyimpan file ke Drive dan mengembalikan URL gambar.

**Keputusan:** Gambar post dan foto profile dikirim dalam bentuk base64 ke endpoint Google Apps Script, lalu URL hasil upload disimpan pada dokumen Firestore.

**Alasan:** Pendekatan ini memudahkan demo upload media, dapat mengurangi hambatan konfigurasi storage, dan tetap menjaga Firestore sebagai penyimpan metadata utama.

**Trade-off:** Upload melalui Apps Script/Drive membuat arsitektur media bergantung pada endpoint eksternal. Validasi file, limit ukuran, keamanan URL, dan error handling perlu diperhatikan lebih lanjut dibanding Firebase Storage langsung.

**Konsekuensi:** Fitur upload dapat berjalan dengan cepat untuk kebutuhan project, tetapi untuk production lebih ideal dibuat abstraction `mediaRepository` atau `mediaDataSource` agar backend media bisa diganti tanpa menyentuh UI.

---

## ADR-007 - SQLite untuk Offline Cache dan Action Queue

**Status:** Accepted

**Konteks:** Requirement kelompok 4 meminta offline-first architecture. Feed harus tetap bisa tampil saat offline dan aksi tertentu perlu disimpan sebelum sync.

**Keputusan:** Menggunakan `expo-sqlite` melalui `sqliteDataSource` untuk:

- Cache postingan berdasarkan kategori seperti `feed`, `saved`, dan `profile`.
- Menyimpan `action_queue` untuk aksi pending seperti follow, unfollow, like, unlike, dan comment.

**Alasan:** SQLite cocok untuk penyimpanan lokal terstruktur, lebih kuat dibanding AsyncStorage untuk data list dan queue, serta mendukung offline-first flow.

**Trade-off:** SQLite menambah kompleksitas schema, parsing JSON, dan mekanisme sinkronisasi. Conflict resolution juga harus dirancang hati-hati jika data server berubah saat user offline.

**Konsekuensi:** Aplikasi dapat menampilkan cached feed saat offline dan punya fondasi pending sync, tetapi masih perlu penguatan untuk conflict resolution yang lebih formal.

---

## ADR-008 - Auto Sync saat Koneksi Kembali Online

**Status:** Accepted

**Konteks:** Aksi sosial dapat dilakukan saat offline, tetapi harus dikirim ke backend saat koneksi tersedia kembali.

**Keputusan:** Menggunakan `useAutoSync` dengan NetInfo untuk mendeteksi koneksi, lalu memanggil `syncUsecases.processOfflineQueue`.

**Alasan:** Pendekatan ini sederhana dan mudah dijelaskan: ketika app mendeteksi internet kembali, queue lokal diproses satu per satu.

**Trade-off:** Sync masih berjalan di level app lifecycle dan belum sepenuhnya background sync native. Jika aplikasi ditutup total, proses sync menunggu aplikasi dibuka kembali.

**Konsekuensi:** Offline queue sudah siap untuk demo dan MVP, tetapi untuk production perlu integrasi lebih dalam dengan background task dan retry policy.

---

## ADR-009 - Optimistic UI untuk Interaksi Sosial

**Status:** Accepted

**Konteks:** Social media app harus terasa responsif. Jika like/comment menunggu server selesai, pengalaman pengguna akan terasa lambat.

**Keputusan:** Beberapa interaksi seperti like, save, comment, dan follow diperbarui di UI terlebih dahulu, lalu request backend diproses melalui repository/use case.

**Alasan:** Optimistic UI membuat aplikasi terasa cepat dan modern, terutama untuk aksi kecil yang sering dilakukan.

**Trade-off:** UI bisa sementara berbeda dengan server jika request gagal. Karena itu perlu rollback/error state yang lebih matang untuk pengembangan selanjutnya.

**Konsekuensi:** UX lebih baik, tetapi tim perlu menjaga konsistensi data setelah request gagal atau saat sync offline diproses.

---

## ADR-010 - Navigasi Menggunakan Stack, Tab, dan Drawer-like Menu

**Status:** Accepted

**Konteks:** Requirement aplikasi membutuhkan navigasi kompleks: authentication flow, tab utama, detail post, public profile, edit profile, dan drawer/offline center.

**Keputusan:** Menggunakan:

- Auth stack untuk login/register.
- App stack untuk area user login.
- Bottom tab untuk Home, Explore, Create, Activity, dan Profile.
- Drawer-like menu custom untuk Settings, Theme, Offline Center, About, dan Logout.

**Alasan:** Stack memudahkan halaman detail, tab cocok untuk fitur utama social media, dan drawer memberi akses ke fitur tambahan tanpa memenuhi tab bar.

**Trade-off:** Drawer dibuat dengan controller/modal custom sehingga UI lebih stabil dan fleksibel, tetapi tidak sepenuhnya memakai API bawaan `createDrawerNavigator`. Ini juga membantu mengurangi risiko konflik runtime dari Reanimated/Worklets yang sempat muncul.

**Konsekuensi:** Navigasi tetap terasa seperti social media modern, tetapi jika requirement dosen harus benar-benar memakai React Navigation Drawer, bagian ini bisa direfactor lagi dengan memastikan konfigurasi Reanimated stabil.

---

## ADR-011 - Reusable Components untuk Mengurangi Screen yang Terlalu Besar

**Status:** Accepted

**Konteks:** Beberapa screen awal seperti Login, Register, CreatePost, Feed, Profile, dan PublicProfile pernah menumpuk terlalu banyak UI dan logic dalam satu file.

**Keputusan:** UI dipisah menjadi reusable components seperti:

- Auth components: `AuthLayout`, `AuthTextField`, `PasswordField`, `GoogleSignInButton`, dan lainnya.
- Feed component: `PostCard`.
- Profile components: `PublicProfileHeader`, `ProfileStat`, `ProfilePostGridItem`, `AnimatedProfileTabs`, dan lainnya.
- Post components: `MediaUploadBox`, `CaptionInput`, `TagEditor`, `UploadSuccessModal`, `FormNoticeModal`, dan lainnya.
- Common components: `ScreenHeader`, `ScreenState`, `AppButton`, `UserAvatar`, dan `IconActionButton`.

**Alasan:** Reusable components membuat screen lebih pendek, lebih fokus pada flow, dan UI lebih konsisten.

**Trade-off:** Jumlah file bertambah, sehingga developer perlu memahami lokasi component. Namun ini lebih sehat dibanding satu screen berisi ratusan baris.

**Konsekuensi:** Maintenance UI lebih mudah dan perubahan visual bisa dilakukan di component yang sama tanpa mengulang kode di banyak screen.

---

## ADR-012 - Menggunakan expo-image untuk Optimasi Gambar

**Status:** Accepted

**Konteks:** Aplikasi social media banyak menampilkan gambar pada feed, profile grid, detail post, dan cached content.

**Keputusan:** Menggunakan `expo-image` untuk rendering gambar.

**Alasan:** `expo-image` menyediakan performa dan caching yang lebih baik dibanding `Image` bawaan React Native, sehingga cocok untuk feed yang sering scroll.

**Trade-off:** Perlu dependency tambahan dan penyesuaian prop seperti `contentFit`.

**Konsekuensi:** Gambar lebih siap untuk optimasi performa dan offline viewing.

---

## ADR-013 - FlatList dan Memoization untuk Performa Feed

**Status:** Accepted

**Konteks:** Feed social media dapat berisi banyak post. Rendering semua item sekaligus dapat membuat aplikasi lambat.

**Keputusan:** Feed menggunakan FlatList dengan konfigurasi performa seperti pagination, refresh, load more, dan reusable `PostCard` yang dimemoisasi.

**Alasan:** FlatList mendukung virtualized rendering sehingga hanya item yang relevan yang dirender. `React.memo`, `useMemo`, dan `useCallback` digunakan untuk mengurangi render ulang yang tidak perlu.

**Trade-off:** Optimasi perlu dijaga agar tidak berlebihan. Memoization yang salah bisa membuat kode lebih sulit dibaca tanpa manfaat besar.

**Konsekuensi:** Feed lebih siap menangani data banyak, tetapi tetap perlu profiling untuk membuktikan performa saat data bertambah.

---

## ADR-014 - Theme Switching melalui Navigation Theme dan Zustand

**Status:** Accepted

**Konteks:** Requirement aplikasi meminta dark/light mode. Theme harus konsisten di screen, navigation, dan drawer.

**Keputusan:** Theme disimpan di `themeStore`, lalu diterapkan melalui `appThemes` dan `NavigationContainer`.

**Alasan:** Satu state theme global membuat seluruh UI dapat membaca warna yang sama. Ini menjaga konsistensi tone ScaleGram.

**Trade-off:** Beberapa style masih memakai warna hardcoded untuk accent atau status tertentu. Hal ini wajar untuk MVP, tetapi perlu dirapikan jika ingin theme sepenuhnya konsisten.

**Konsekuensi:** Light/dark mode bisa dikontrol dari satu tempat, termasuk dari drawer menu.

---

## ADR-015 - Error Handling dan Graceful UI State

**Status:** Accepted

**Konteks:** Aplikasi mobile harus menangani loading, empty state, error, dan offline state dengan baik agar tidak terlihat crash.

**Keputusan:** Presentation layer menggunakan komponen seperti `ScreenState`, modal feedback, dan fallback error message. Repository juga mengembalikan fallback cache ketika Firebase gagal.

**Alasan:** User tetap mendapat informasi jelas saat data kosong, loading, atau koneksi bermasalah.

**Trade-off:** Error boundary per screen belum sepenuhnya formal di semua screen. Saat ini pendekatan masih melalui state dan fallback UI.

**Konsekuensi:** UX lebih aman dibanding hanya console error, tetapi requirement error boundary masih perlu dilengkapi jika dosen meminta implementasi eksplisit.

---

## ADR-016 - Testing Fokus pada Unit dan Komponen Kritis

**Status:** Accepted

**Konteks:** Testing diperlukan untuk memastikan utility, repository, use case, dan beberapa komponen UI berjalan sesuai ekspektasi.

**Keputusan:** Menggunakan Jest dan React Native Testing Library untuk test seperti validator, time format, repository, use case, ScreenState, ScreenHeader, PostCard, LoginScreen, dan FeedScreen.

**Alasan:** Testing difokuskan pada bagian yang sering dipakai atau punya logic penting agar risiko regression lebih kecil.

**Trade-off:** Belum semua screen punya test end-to-end. Untuk project mobile, E2E membutuhkan setup lebih besar seperti Detox atau Maestro.

**Konsekuensi:** Kualitas dasar sudah lebih terjaga, tetapi coverage perlu ditambah pada flow utama seperti create post, profile, notification, dan offline sync.

---

## Ringkasan Trade-off Utama

1. **Clean Architecture vs kecepatan development:** Struktur lebih rapi dan maintainable, tetapi jumlah file dan import lebih banyak.
2. **Firebase vs backend custom:** Firebase mempercepat MVP, tetapi aplikasi mengikuti batasan query, index, dan pricing Firebase.
3. **Google Apps Script/Drive vs Firebase Storage:** Upload lebih mudah untuk demo, tetapi butuh perhatian keamanan, limit, dan abstraction jika ingin production-ready.
4. **SQLite offline-first vs kompleksitas sync:** User mendapat cache dan queue offline, tetapi conflict resolution dan retry policy menjadi lebih kompleks.
5. **Optimistic UI vs konsistensi data:** UI terasa cepat, tetapi perlu rollback jika request gagal.
6. **Custom drawer vs drawer bawaan:** UI lebih stabil dan fleksibel, tetapi jika syarat formal harus memakai React Navigation Drawer, perlu refactor ulang.
7. **Zustand vs Redux Toolkit:** Zustand lebih ringan, tetapi struktur state harus dijaga secara manual.
8. **Memoization/performance tuning vs readability:** Performa feed lebih baik, tetapi optimasi harus tetap terukur lewat profiler.

## Catatan Pengembangan Lanjutan

- Buat `mediaRepository` agar upload Drive/Firebase Storage bisa diganti tanpa menyentuh screen.
- Pindahkan semua use case agar menerima repository dari dependency injection, bukan import implementasi langsung.
- Tambahkan error boundary eksplisit di setiap screen.
- Lengkapi conflict resolution untuk offline queue.
- Tambahkan dokumentasi profiling dan bundle analysis.
- Tambahkan Architecture Decision Record baru setiap ada perubahan besar pada backend, offline sync, navigation, atau media storage.
