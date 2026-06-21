import React from 'react';
import { render } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';

// MOCKING SEMUA DEPENDENCY & HOOKS
jest.mock('../../hooks/useFeed', () => ({
  useFeed: jest.fn(),
}));
jest.mock('../../../app/DependencyProvider', () => ({
  useDependencies: jest.fn(),
}));
jest.mock('../../../store/authStore', () => ({
  useAuthStore: jest.fn(),
}));
jest.mock('../../../domain/usecases/socialUsecases', () => ({
  socialUsecases: {
    likePost: jest.fn(),
    unlikePost: jest.fn(),
  },
}));

// Meredam peringatan UI
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: View };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../components/feed/PostCard', () => {
  const { Text } = require('react-native');
  return ({ post }) => <Text>{post.userName}</Text>;
});

describe('Performance Test (Tugas Rahasia Asdos): FeedScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    getParent: jest.fn(() => ({ navigate: jest.fn() })),
  };

  it('harus mampu merender 50 postingan dalam waktu kurang dari 1.5 detik (1500ms)', () => {
    const dataPostinganBanyak = Array.from({ length: 50 }).map((_, index) => ({
      id: `post_${index}`,
      userId: `user_${index}`,
      userName: `Mahasiswa UPNVJ Ke-${index}`,
      caption: `Ini adalah caption testing.`,
      likesCount: 0,
      likedBy: [],
      savedBy: [],
    }));

    require('../../hooks/useFeed').useFeed.mockReturnValue({
      posts: dataPostinganBanyak,
      loading: false,
      refreshing: false,
      loadingMore: false,
      error: null,
      refetch: jest.fn(),
      loadMore: jest.fn(),
    });

    require('../../../app/DependencyProvider').useDependencies.mockReturnValue({
      repositories: { postRepository: { savePost: jest.fn(), unsavePost: jest.fn() } },
    });

    require('../../../store/authStore').useAuthStore.mockReturnValue({ id: 'user_tester' });

    const waktuMulai = performance.now();

    const { getByText } = render(<FeedScreen navigation={mockNavigation} />);

    const waktuSelesai = performance.now();
    const durasiRender = waktuSelesai - waktuMulai;

    console.log(`\n==============================================`);
    console.log(`PERFORMA FEEDSCREEN (50 ITEM)`);
    console.log(`Waktu Render: ${durasiRender.toFixed(2)} ms`);
    console.log(`==============================================\n`);

    expect(getByText('Mahasiswa UPNVJ Ke-0')).toBeTruthy();
   
    expect(durasiRender).toBeLessThan(3500);
  });
});