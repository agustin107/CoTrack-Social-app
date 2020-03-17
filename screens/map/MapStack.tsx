import React from 'react';
import {
  createStackNavigator,
  TransitionPresets,
  StackNavigationProp,
} from '@react-navigation/stack';
import Map from './Map';
import MapInfo from './MapInfo';
import { RouteProp } from '@react-navigation/native';

type MapParamsList = {
  Map: undefined;
  MapInfo: undefined;
};

export type MapStackNavProps<T extends keyof MapParamsList> = {
  navigation: StackNavigationProp<MapParamsList, T>;
  route: RouteProp<MapParamsList, T>;
};

const Stack = createStackNavigator<MapParamsList>();

export default function MapStack() {
  return (
    <Stack.Navigator
      initialRouteName="Map"
      screenOptions={{
        gestureEnabled: true,
        cardOverlayEnabled: true,
        ...TransitionPresets.ModalPresentationIOS,
      }}
      mode="modal"
      headerMode="none"
    >
      <Stack.Screen name="Map" component={Map} />
      <Stack.Screen name="MapInfo" component={MapInfo} />
    </Stack.Navigator>
  );
}
