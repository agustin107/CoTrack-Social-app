import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/TabBarIcon';
import Diagnostic from '../screens/Diagnostic';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Diagnostic';
const isIOS = Platform.OS === 'ios';

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <Tab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
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
          title: 'Alerta de Contacto',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name={isIOS ? 'ios-map' : 'md-map'} />
          ),
        }}
        component={Diagnostic}
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
      <Tab.Screen
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
      />
    </Tab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName =
    route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Diagnostic':
      return 'Diagnóstico';
    case 'Map':
      return 'Alerta de Contacto';
    case 'Prevention':
      return 'Prevención';
    case 'Data':
      return 'Datos';
  }
}
