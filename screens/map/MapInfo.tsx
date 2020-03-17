import React from 'react';
import { View, Button, Text } from 'react-native';
import { MapStackNavProps } from './MapStack';

export default function MapInfo({ navigation }: MapStackNavProps<'MapInfo'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 30 }}>This is a modal!</Text>
      <Button onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
}
