/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Coordinates from '../models/Coordinates';

declare const google: any;

class MapsService {
  restaurants: any[] = [];

  map: any;

  constructor(mapContainer: HTMLDivElement | null) {
    this.initMap(mapContainer);
  }

  initMap(mapContainer: HTMLDivElement | null): void {
    this.map = new google.maps.Map(mapContainer, {
      zoom: 6,
      center: { lat: 59.3297408, lng: 18.0158464 }, // TODO ändra koordinater
    });
  }

  retrieveRestaurants(centerCoordinates: Coordinates, radius: number) {
    return new Promise((resolve) => {
      const request = {
        location: centerCoordinates,
        radius,
        type: ['restaurant'],
      };
      const service: any = new google.maps.places.PlacesService(this.map);
      service.nearbySearch(request, (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.restaurants = results;
          resolve(results);
        } else {
          resolve(null);
        }
      });
    });
  }

  setMarker(marker: any) {
    marker.setMap(this.map);
  }

  setMarkers(markers: any[]) {
    markers.forEach((marker) => {
      marker.setMap(this.map);
    });
  }
}

export default MapsService;
