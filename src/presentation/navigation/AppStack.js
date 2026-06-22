import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppDrawer from './AppDrawer';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppDrawer} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
    </Stack.Navigator>
  );
}
