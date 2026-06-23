import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UserAvatar from '../components/common/UserAvatar';
import MainTabs from './MainTabs';
import OfflineCenterScreen from '../screens/offline/OfflineCenterScreen';
import { DrawerControllerProvider } from './DrawerController';
import { appThemes } from '../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const PURPLE = '#6366F1';

export default function AppDrawer() {
  return <AppDrawerNavigator />;
}

export function AppDrawerNavigator({ initialScreen = 'MainTabs', screens }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState(initialScreen);
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const screenComponents = useMemo(
    () => ({
      MainTabs,
      OfflineCenter: OfflineCenterScreen,
      ...screens,
    }),
    [screens]
  );

  const drawerController = useMemo(
    () => ({
      openDrawer: () => setDrawerVisible(true),
      closeDrawer: () => setDrawerVisible(false),
    }),
    []
  );

  const localNavigation = useMemo(
    () => ({
      canGoBack: () => activeScreen !== 'MainTabs',
      goBack: () => setActiveScreen('MainTabs'),
      navigate: (screenName) => setActiveScreen(screenName),
    }),
    [activeScreen]
  );

  const renderContent = useMemo(() => {
    const ActiveComponent = screenComponents[activeScreen] || screenComponents.MainTabs;
    return <ActiveComponent navigation={localNavigation} />;
  }, [activeScreen, localNavigation, screenComponents]);

  return (
    <DrawerControllerProvider value={drawerController}>
      <View style={[styles.container, { backgroundColor: colors.background || '#FFFFFF' }]}>
        {renderContent}
        <MinimalDrawer
          visible={drawerVisible}
          colors={colors}
          onClose={drawerController.closeDrawer}
          onNavigate={(screenName) => {
            setActiveScreen(screenComponents[screenName] ? screenName : 'MainTabs');
            setDrawerVisible(false);
          }}
        />
      </View>
    </DrawerControllerProvider>
  );
}

function MinimalDrawer({ visible, colors, onClose, onNavigate }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(248, Math.max(214, width * 0.68));
  const slideProgress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const [aboutVisible, setAboutVisible] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleThemeMode = useThemeStore((state) => state.toggleThemeMode);
  const displayName = user?.displayName || 'ScaleGram User';
  const email = user?.email || 'Keep your feed moving';

  useEffect(() => {
    let frameId;

    if (visible) {
      slideProgress.stopAnimation();
      slideProgress.setValue(0);
      setMounted(true);
      frameId = requestAnimationFrame(() => {
        Animated.timing(slideProgress, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });

      return () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    Animated.timing(slideProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [slideProgress, visible]);

  const backdropOpacity = slideProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const drawerTranslateX = slideProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  const drawerScale = slideProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const handleAbout = () => {
    setAboutVisible(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      Alert.alert('Logout gagal', error?.message || 'Tidak bisa logout saat ini.');
    }
  };

  const items = [
    {
      key: 'theme',
      label: `Theme: ${themeMode === 'light' ? 'Light' : 'Dark'}`,
      icon: themeMode === 'light' ? 'sunny-outline' : 'moon-outline',
      onPress: toggleThemeMode,
    },
    {
      key: 'offline',
      label: 'Offline Center',
      icon: 'cloud-offline-outline',
      onPress: () => onNavigate('OfflineCenter'),
    },
    {
      key: 'about',
      label: 'About',
      icon: 'information-circle-outline',
      onPress: handleAbout,
    },
  ];

  return (
    <>
      {mounted ? (
      <Modal visible transparent animationType="none" onRequestClose={onClose}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          <Animated.View
            style={[
              styles.drawerPanel,
              {
                width: drawerWidth,
                paddingTop: Math.max(insets.top, 18),
                backgroundColor: colors.card || '#FFFFFF',
                opacity: slideProgress,
                transform: [{ translateX: drawerTranslateX }, { scale: drawerScale }],
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={[
                styles.drawerContent,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.drawerHeader}>
                <View style={styles.avatarRing}>
                  <UserAvatar name={displayName} uri={user?.photoURL} size={58} />
                </View>
                <View style={styles.headerTextWrap}>
                  <Text style={[styles.drawerTitle, { color: colors.text || '#111827' }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={[styles.drawerSubtitle, { color: colors.mutedText || '#6B7280' }]} numberOfLines={1}>
                    {email}
                  </Text>
                </View>
            </View>

              <View style={styles.syncCard}>
                <View style={styles.syncIcon}>
                  <Ionicons name="sync-outline" size={19} color={PURPLE} />
                </View>
                <View style={styles.syncCopy}>
                  <Text style={styles.syncTitle}>Offline-first ready</Text>
                  <Text style={styles.syncText}>Cache, queue, and sync prepared</Text>
                </View>
              </View>

              <View style={styles.menuGroup}>
                {items.map((item) => (
                  <DrawerMenuItem key={item.key} item={item} colors={colors} />
                ))}
              </View>

              <TouchableOpacity style={styles.logoutButton} activeOpacity={0.78} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={21} color="#EF4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
          <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        </View>
      </Modal>
      ) : null}
      <AboutModal visible={aboutVisible} colors={colors} onClose={() => setAboutVisible(false)} />
    </>
  );
}

function AboutModal({ visible, colors, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.aboutRoot}>
        <TouchableOpacity style={styles.aboutBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.aboutCard, { backgroundColor: colors.card || '#FFFFFF' }]}>
          <View style={styles.aboutIconWrap}>
            <Ionicons name="sparkles-outline" size={28} color={PURPLE} />
          </View>
          <Text style={[styles.aboutTitle, { color: colors.text || '#111827' }]}>ScaleGram</Text>
          <Text style={[styles.aboutMessage, { color: colors.mutedText || '#6B7280' }]}>
            Social feed dengan offline-first flow untuk cache, queue, dan sync. Dibuat supaya postingan tetap terasa ringan walau koneksi sedang tidak stabil.
          </Text>
          <View style={styles.aboutFeatureRow}>
            <AboutPill icon="cloud-done-outline" label="Offline ready" />
            <AboutPill icon="sync-outline" label="Sync queue" />
          </View>
          <TouchableOpacity style={styles.aboutButton} activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.aboutButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function AboutPill({ icon, label }) {
  return (
    <View style={styles.aboutPill}>
      <Ionicons name={icon} size={15} color={PURPLE} />
      <Text style={styles.aboutPillText}>{label}</Text>
    </View>
  );
}

function DrawerMenuItem({ item, colors }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.76} onPress={item.onPress}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={item.icon} size={20} color={PURPLE} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text || '#111827' }]}>
        {item.label}
      </Text>
      <Ionicons name="chevron-forward" size={17} color={colors.mutedText || '#9CA3AF'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.32)',
  },
  dismissArea: {
    flex: 1,
  },
  drawerPanel: {
    height: '100%',
    shadowColor: '#111827',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 18,
  },
  drawerContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  drawerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  syncCard: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#EEF2FF',
    marginTop: 4,
    marginBottom: 18,
  },
  syncIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  syncCopy: {
    flex: 1,
    marginLeft: 10,
  },
  syncTitle: {
    color: '#312E81',
    fontSize: 13,
    fontWeight: '900',
  },
  syncText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  menuGroup: {
    gap: 8,
  },
  menuItem: {
    minHeight: 52,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 11,
  },
  logoutButton: {
    height: 52,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FEF2F2',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 11,
  },
  aboutRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  aboutBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.46)',
  },
  aboutCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 20,
  },
  aboutIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  aboutMessage: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  aboutFeatureRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  aboutPill: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(99, 102, 241, 0.10)',
  },
  aboutPillText: {
    color: PURPLE,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
  },
  aboutButton: {
    height: 44,
    alignSelf: 'stretch',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    marginTop: 20,
  },
  aboutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
