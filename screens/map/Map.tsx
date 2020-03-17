import React, { useState, useEffect, useRef } from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Permissions from 'expo-permissions';
import MapView, {
  // PROVIDER_DEFAULT,
  // PROVIDER_GOOGLE,
  // MarkerAnimated,
  AnimatedRegion,
  Circle,
  // Heatmap,
} from 'react-native-maps';
import BottomSheet from 'reanimated-bottom-sheet';

import { locationService } from '../../utils/locationService';
import { LocationData } from 'expo-location';
// import Animated from 'react-native-reanimated';
// import { getTabBarHeight } from '../components/TabBarComponent';
import { useSafeArea } from 'react-native-safe-area-context';

const LOCATION_TASK_NAME = 'background-location-task';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// const OVERLAY_TOP_LEFT_COORDINATE = [35.68184060244454, 139.76531982421875];
// const OVERLAY_BOTTOM_RIGHT_COORDINATE = [35.679609609368576, 139.76806640625];

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

function PanelContent() {
  return (
    <View style={panelStyles.panel}>
      <Text style={panelStyles.panelTitle}>San Francisco Airport</Text>
      <Text style={panelStyles.panelSubtitle}>
        International Airport - 40 miles away
      </Text>
      <View style={panelStyles.panelButton}>
        <Text style={panelStyles.panelButtonTitle}>Directions</Text>
      </View>
      <View style={panelStyles.panelButton}>
        <Text style={panelStyles.panelButtonTitle}>Search Nearby</Text>
      </View>
      <Image
        style={panelStyles.photo}
        source={require('../../assets/images/airport-photo.jpg')}
      />
    </View>
  );
}

function PanelHeader() {
  return (
    <View style={panelStyles.header}>
      <View style={panelStyles.panelHeader}>
        <View style={panelStyles.panelHandle} />
      </View>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  panel: {
    padding: 20,
    backgroundColor: '#f7f5eee8',
  },
  header: {
    backgroundColor: '#f7f5eee8',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  photo: {
    width: '100%',
    height: 225,
    marginTop: 30,
  },
});

export default function Map({ navigation }) {
  // navigation.setOptions({ tabBarVisible: false });
  const [error, setError] = useState<string | undefined>();
  const [location, setLocation] = useState<LocationData | undefined>();
  const [coords, setCoords] = useState<
    { latitude: number; longitude: number } | undefined
  >();

  const [coordinate] = useState(new AnimatedRegion());
  const mapRef = useRef<MapView>();
  const refRBSheet = useRef();

  const insets = useSafeArea();

  useEffect(() => {
    async function getLocationAsync() {
      // let {
      //   status,
      //   permissions: {
      //     location: { ios },
      //   },
      // } = await Permissions.askAsync(Permissions.LOCATION);
      let { status, ios } = await Location.getPermissionsAsync();
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
            // latitude: 40.710065,
            // longitude: -74.013714,
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
      console.log('stopLocationUpdatesAsync');
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  let text = 'Cargando..';
  if (error) {
    text = error;
  } else if (coords) {
    text = JSON.stringify(coords);
  }

  return (
    <View style={[styles.container]}>
      {location && (
        <MapView
          ref={mapRef}
          // provider={PROVIDER_GOOGLE}
          showsUserLocation
          // followsUserLocation
          initialRegion={{
            ...location.coords,
            // latitude: 40.710065,
            // longitude: -74.013714,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          style={styles.map}
          showsMyLocationButton={false}
        >
          <Circle
            center={location.coords}
            radius={700}
            fillColor="rgba(0, 200, 0, 0.5)"
            strokeColor="rgba(0, 200, 0, 0.5)"
            zIndex={2}
            strokeWidth={1}
          />
          <Circle
            center={{
              latitude: 40.729301,
              longitude: -73.996745,
            }}
            radius={700}
            fillColor="rgba(255, 142, 0, 0.5)"
            strokeColor="rgba(255, 142, 0, 0.5)"
            // zIndex={2}
            strokeWidth={1}
          />
          {/* <Heatmap
            points={[
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                weight: 50,
              },
              {
                latitude: 40.729301,
                longitude: -73.996745,
                weight: 90,
              },
            ]}
            radius={Platform.OS === 'ios' ? 150 : 50}
            // opacity={0.7}
            gradient={{
              colors: ['#79BC6A', '#BBCF4C', '#EEC20B', '#F29305', '#E50000'],
              startPoints: [0.01, 0.25, 0.5, 0.75, 1],
              colorMapSize: 100,
            }}
          /> */}
          {/* <MarkerAnimated coordinate={coordinate} /> */}
        </MapView>
      )}
      <View style={[styles.buttonContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, styles.locationButton]}
          onPress={() => navigation.navigate('MapInfo')}
        >
          <Ionicons
            name="md-information-circle-outline"
            size={24}
            color="rgba(66,135,244,1)"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, styles.infoButton]}
          onPress={() =>
            mapRef.current.animateToRegion({
              ...location.coords,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            })
          }
        >
          <Ionicons name="md-locate" size={24} color="rgba(66,135,244,1)" />
        </TouchableOpacity>
      </View>
      <BottomSheet
        ref={refRBSheet}
        snapPoints={['50%', 50]}
        renderContent={PanelContent}
        renderHeader={PanelHeader}
        initialSnap={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    marginHorizontal: 10,
    paddingHorizontal: 12,
    minWidth: 50,
  },
  locationButton: {
    marginTop: 12,
    marginBottom: StyleSheet.hairlineWidth,
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
  },
  infoButton: {
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
