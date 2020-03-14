import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Permissions from 'expo-permissions';
import MapView, {
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  MarkerAnimated,
  AnimatedRegion,
  // Marker
} from 'react-native-maps';
import { locationService } from '../utils/locationService';
import { LocationData } from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.log('error', error);
    // check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data as any;
    // console.log("locations", locations);
    const { latitude, longitude } = locations[0].coords;
    locationService.setLocation({
      latitude,
      longitude,
    });
  }
});

export default function LocationAlerts() {
  const [error, setError] = useState<string | undefined>();
  const [location, setLocation] = useState<LocationData | undefined>();
  const [coords, setCoords] = useState<
    { latitude: number; longitude: number } | undefined
  >();

  const [coordinate] = useState(new AnimatedRegion());

  useEffect(() => {
    async function getLocationAsync() {
      let {
        status,
        permissions: {
          location: { ios },
        },
      } = await Permissions.askAsync(Permissions.LOCATION);
      console.log('getLocationAsync -> ios, status', ios, status);
      if (status !== 'granted') {
        setError('El permiso para acceder a la ubicación fue denegado');
      } else if (Platform.OS === 'ios' && ios.scope !== 'always') {
        setError(
          'El permiso para acceder a la ubicación en todo momento fue denegado',
        );
      } else {
        try {
          let location = await Location.getCurrentPositionAsync({});
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced,
            // distanceInterval: 50
            // deferredUpdatesDistance: 1000
          });
          setLocation(location);
          const newCoordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          coordinate.timing(newCoordinate).start();
        } catch (e) {
          console.log('getLocationAsync -> e', e);
          setError('Ups, error al intentar obtener ubicación');
        }
      }
    }

    function onLocationUpdate({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) {
      const newCoordinate = {
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      setCoords({ latitude, longitude });

      coordinate.timing(newCoordinate).start();
    }

    getLocationAsync();

    locationService.subscribe(onLocationUpdate);
    return async () => {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('stopLocationUpdatesAsync');
    };
  }, []);

  let text = 'Cargando..';
  if (error) {
    text = error;
  } else if (coords) {
    text = JSON.stringify(coords);
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          // followsUserLocation
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          style={styles.map}
        >
          <MarkerAnimated coordinate={coordinate} />
        </MapView>
      )}
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  map: {
    // width,
    // height
    ...StyleSheet.absoluteFillObject,
  },
});
