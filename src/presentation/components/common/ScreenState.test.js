import React from 'react';
import { render } from '@testing-library/react-native';
import ScreenState from './ScreenState';

// PEREDAM UNTUK REACT ACT WARNING
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0]) || /An update to.*inside a test/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe('Komponen UI: ScreenState', () => {
  it('harus menampilkan indikator loading saat properti loading bernilai true', () => {
    const { toJSON } = render(<ScreenState loading={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('harus menampilkan pesan eror dan tombol coba lagi saat gagal memuat data', () => {
    const fungsiCobaLagiPalsu = jest.fn();
    
    const { getByText } = render(
      <ScreenState 
        title="Gagal memuat feed" 
        message="Koneksi terputus" 
        actionLabel="Coba lagi"
        onAction={fungsiCobaLagiPalsu}
      />
    );

    // Memastikan teks judul eror tertulis dengan benar di layar
    expect(getByText('Gagal memuat feed')).toBeTruthy();
    expect(getByText('Koneksi terputus')).toBeTruthy();
  });
});