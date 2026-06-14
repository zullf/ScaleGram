import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FeedScreen from '../screens/feed/FeedScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SearchScreen from '../screens/search/SearchScreen';
import NotificationScreen from '../screens/notification/NotificationScreen';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: {
    focused: 'home',
    unfocused: 'home-outline',
  },
  Explore: {
    focused: 'compass',
    unfocused: 'compass-outline',
  },
  CreatePost: {
    focused: 'add-circle',
    unfocused: 'add-circle-outline',
  },
  Alerts: {
    focused: 'notifications',
    unfocused: 'notifications-outline',
  },
  Profile: {
    focused: 'person',
    unfocused: 'person-outline',
  },
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const bottomOffset = Platform.OS === 'android' ? 0 : 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 54 + insets.bottom,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          bottom: bottomOffset,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            name={focused ? tabIcons[route.name].focused : tabIcons[route.name].unfocused}
            size={focused ? 25 : 23}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Explore"
        component={SearchScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
