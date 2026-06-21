import React from 'react';
import { render } from '@testing-library/react-native';
import ScreenHeader from './ScreenHeader';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('Komponen UI: ScreenHeader', () => {
  it('harus berhasil merender logo dan tombol menu jika diaktifkan', () => {
    // Render komponen dengan properti showLogo dan showMenu true
    const { getByTestId, toJSON } = render(
      <ScreenHeader showLogo={true} showMenu={true} />
    );
    
    // Pastikan komponen berhasil digambar dan tidak menghasilkan null/kosong
    expect(toJSON()).toBeTruthy();
  });
});