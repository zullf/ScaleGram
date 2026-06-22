import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UserAvatar from '../components/common/UserAvatar';
import MainTabs from './MainTabs';
import OfflineCenterScreen from '../screens/offline/OfflineCenterScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { appThemes } from '../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const Drawer = createDrawerNavigator();
const PURPLE = '#6366F1';

export default function AppDrawer() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <ScaleGramDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(17, 24, 39, 0.32)',
        drawerStyle: {
          width: 304,
          backgroundColor: colors.card || '#FFFFFF',
        },
        sceneContainerStyle: {
          backgroundColor: colors.background || '#FFFFFF',
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="OfflineCenter" component={OfflineCenterScreen} />
    </Drawer.Navigator>
  );
}

function ScaleGramDrawerContent({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleThemeMode = useThemeStore((state) => state.toggleThemeMode);
  const colors = appThemes[themeMode].colors;
  const displayName = user?.displayName || 'ScaleGram User';
  const email = user?.email || 'Keep your feed moving';

  const handleAbout = () => {
    Alert.alert(
      'About ScaleGram',
      'ScaleGram is a social media app with an offline-first experience for posts, interactions, and sync queues.'
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.closeDrawer();
    } catch (error) {
      Alert.alert('Logout gagal', error?.message || 'Tidak bisa logout saat ini.');
    }
  };

  const items = [
    {
      key: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('Settings'),
    },
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
      onPress: () => navigation.navigate('OfflineCenter'),
    },
    {
      key: 'about',
      label: 'About',
      icon: 'information-circle-outline',
      onPress: handleAbout,
    },
  ];

  return (
    <DrawerContentScrollView
      contentContainerStyle={[
        styles.drawerContent,
        {
          paddingTop: Math.max(insets.top, 18),
          backgroundColor: colors.card || '#FFFFFF',
        },
      ]}
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
    </DrawerContentScrollView>
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
  drawerContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
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
});
