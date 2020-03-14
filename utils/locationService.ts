const LocationService = () => {
  let subscribers = [];
  let location = {
    latitude: 0,
    longitude: 0,
  };

  return {
    subscribe: sub => subscribers.push(sub),
    setLocation: coords => {
      location = coords;
      subscribers.forEach(sub => sub(location));
    },
    unsubscribe: sub => {
      subscribers = subscribers.filter(_sub => _sub !== sub);
    },
  };
};

export const locationService = LocationService();
