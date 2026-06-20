import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import PostDetailScreen from '../screens/post/PostDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
}
