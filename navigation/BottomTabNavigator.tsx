import * as React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';
import Diagnostic from '../screens/Diagnostic';
import MapStack from '../screens/map/MapStack';

const INITIAL_ROUTE_NAME = 'Map';
const isIOS = Platform.OS === 'ios';

type TabsParamsList = {
  Diagnostic: undefined;
  Map: undefined;
  Prevention: undefined;
};

const Tab = createBottomTabNavigator<TabsParamsList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      // tabBar={TabBarComponent}
    >
      <Tab.Screen
        name="Diagnostic"
        component={Diagnostic}
        options={{
          title: 'Diagnóstico',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={isIOS ? 'ios-medkit' : 'md-medkit'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name={isIOS ? 'ios-map' : 'md-map'} />
          ),
          // tabBarVisible: false,
        }}
        component={MapStack}
      />
      <Tab.Screen
        name="Prevention"
        options={{
          title: 'Prevención',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={isIOS ? 'ios-medical' : 'md-medical'}
            />
          ),
        }}
        component={Diagnostic}
      />
      {/* <Tab.Screen
        name="Data"
        options={{
          title: 'Datos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={isIOS ? 'ios-archive' : 'md-archive'}
            />
          ),
        }}
        component={Diagnostic}
      /> */}
    </Tab.Navigator>
  );
}
