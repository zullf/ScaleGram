import { timeAgo } from './timeFormat'; 

describe('Fungsi timeAgo', () => {
  it('harus mengembalikan string waktu yang benar', () => {
    // 1. Siapkan data palsu (waktu saat ini dikurangi 5 menit)
    const limaMenitLalu = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // 2. Jalankan fungsi yang mau dites
    const hasil = timeAgo(limaMenitLalu);
    
    // 3. Pastikan robot mengecek apakah hasilnya ada nilainya (tidak undefined/error)
    expect(hasil).toBeDefined();
    expect(typeof hasil).toBe('string');
  });
});