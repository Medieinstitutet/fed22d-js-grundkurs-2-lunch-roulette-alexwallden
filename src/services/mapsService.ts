/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import getUserCoordinates from './inventory/getUserCoordinates';
import Coordinates from '../models/Coordinates';

declare const google: any;

class MapsService {
  restaurants: any[] = [];

  map: any;

  initMap(): void {
    console.log('initMap körd');
    const mapContainer: HTMLDivElement | null = document.querySelector('#map');
    this.map = new google.maps.Map(mapContainer, {
      zoom: 6, // TODO ändra koordinater
      center: { lat: 59.3297408, lng: 18.0158464 },
    });
  }

  retrieveRestaurants(userCoordinates: Coordinates, radius: number) {
    return new Promise((resolve) => {
      const request = {
        location: userCoordinates,
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
}

export default MapsService;

// renderRestaurants
// rouletten
// hide markers
