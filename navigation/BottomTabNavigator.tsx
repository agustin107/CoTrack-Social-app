import * as React from 'react';
import { Platform, View, Text, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  TransitionPresets,
  StackNavigationProp,
} from '@react-navigation/stack';

import TabBarIcon from '../components/TabBarIcon';
import Diagnostic from '../screens/Diagnostic';
import Map from '../screens/Map';
import { RootStackParamList } from './MainNavigator';
import { RouteProp, TabNavigationState } from '@react-navigation/native';

type TabsParamsList = {
  Diagnostic: undefined;
  Map: undefined;
  Prevention: undefined;
};

type MapParamsList = {
  Map: undefined;
  MapInfo: undefined;
};

const Tab = createBottomTabNavigator<TabsParamsList>();
const INITIAL_ROUTE_NAME = 'Map';
const isIOS = Platform.OS === 'ios';

const MapStack = createStackNavigator<MapParamsList>();

function ModalScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 30 }}>This is a modal!</Text>
      <Button onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
}

function MapStackScreen() {
  return (
    <MapStack.Navigator
      initialRouteName="Map"
      screenOptions={{
        gestureEnabled: true,
        cardOverlayEnabled: true,
        ...TransitionPresets.ModalPresentationIOS,
      }}
      mode="modal"
      headerMode="none"
    >
      <MapStack.Screen name="Map" component={Map} />
      <MapStack.Screen name="MapInfo" component={ModalScreen} />
    </MapStack.Navigator>
  );
}

type TabsNavigationProp = StackNavigationProp<RootStackParamList, 'Root'>;

type Props = {
  navigation: TabsNavigationProp;
  route: RouteProp<RootStackParamList, 'Root'> & { state?: TabNavigationState };
};

export default function BottomTabNavigator({ navigation, route }: Props) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  React.useLayoutEffect(() => {
    const routeName =
      route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;
    navigation.setOptions({
      headerShown: routeName !== 'Map',
      headerTitle: getHeaderTitle(routeName),
    });
  }, [navigation, route]);

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
        component={MapStackScreen}
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

function getHeaderTitle(routeName) {
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
