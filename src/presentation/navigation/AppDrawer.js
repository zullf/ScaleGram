import { createDrawerNavigator } from '@react-navigation/drawer';

import MainTabs from './MainTabs';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="HomeTabs"
        component={MainTabs}
        options={{ title: 'ScaleGram' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
}
