import { isValidEmail } from './validators';

describe('Pabrik Pengujian: validators (Pengecek Data)', () => {
  
  describe('Fungsi isValidEmail', () => {
    it('harus mengembalikan true (Lolos) untuk format email yang benar', () => {
      expect(isValidEmail('bima@gmail.com')).toBe(true);
      expect(isValidEmail('testing@scalegram.com')).toBe(true);
      expect(isValidEmail('mahasiswa.keren@kampus.ac.id')).toBe(true);
    });

    it('harus mengembalikan false (Gagal) untuk format email yang salah', () => {
      expect(isValidEmail('bimasiluman.com')).toBe(false); // Tidak ada @
      expect(isValidEmail('bima@gmail')).toBe(false); // Tidak ada dot (.)
      expect(isValidEmail('@gmail.com')).toBe(false); // Tidak ada nama depan
      expect(isValidEmail('bima@.com')).toBe(false); // Nama domain kosong
      expect(isValidEmail('bima @ gmail . com')).toBe(false); // Ada spasi 
    });
  });

});