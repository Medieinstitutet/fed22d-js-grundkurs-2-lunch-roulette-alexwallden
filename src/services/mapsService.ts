/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Coordinates from '../models/Coordinates';
import Restaurant from '../models/Restaurant';
import wait from '../inventory/helpers';

declare const google: any;

declare global {
  interface Window {
    initMap: () => void;
  }
}

class MapsService {
  openRestaurants: Restaurant[] = [];

  removedRestaurants: Restaurant[] = [];

  map: any;

  constructor(mapContainer: HTMLDivElement | null) {
    this.initMap(mapContainer);
  }

  initMap(mapContainer: HTMLDivElement | null): void {
    this.map = new google.maps.Map(mapContainer, {
      zoom: 4,
      center: { lat: 63.3297408, lng: 18.0158464 }, // TODO ändra koordinater
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
      service.nearbySearch(request, async (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.openRestaurants = [];
          results.forEach((result) => {
            if (result.business_status === 'OPERATIONAL') {
              const restaurant = new Restaurant(result, userCoordinates);
              this.openRestaurants.push(restaurant);
            }
          });
          console.log(this.openRestaurants);
          await this.retrieveDetails();
          switch (radius) {
            case 500:
              this.map.setZoom(15);
              break;
            case 1000:
              this.map.setZoom(14);
              break;
            case 3000:
              this.map.setZoom(12);
              break;
            default:
              this.map.setZoom(12);
              break;
          }
          resolve(results);
        } else {
          resolve(null);
        }
      });
    });
  }

  async retrieveDetails() {
    for (let index = 0; index < this.openRestaurants.length; index++) {
      const restaurant = this.openRestaurants[index];
      const request = { placeId: restaurant.info.place_id, fields: ['name', 'opening_hours', 'utc_offset_minutes'] };
      const service = new google.maps.places.PlacesService(this.map);
      service.getDetails(request, (place: any, status: any) => {
        console.log('Status:', status);
        if (status === google.maps.places.PlacesServiceStatus.OK && place.opening_hours) {
          const isOpenNow = place.opening_hours.isOpen();
          console.log(isOpenNow);
          if (isOpenNow) {
            restaurant.details = place;
            restaurant.isOpen = true;
          }
        }
      });
      await wait(300);
    }
    this.openRestaurants.forEach((restaurant) => {
      if (!restaurant.isOpen) {
        this.removedRestaurants.push(restaurant);
        const restaurantIndex = this.openRestaurants.indexOf(restaurant);
        this.openRestaurants.splice(restaurantIndex, 1);
      }
    });
    console.log(this.openRestaurants);
    console.log(this.removedRestaurants);
  }

  attachInfoWindows() {
    this.openRestaurants.forEach((restaurant) => {
      restaurant.marker.addListener('click', () => {
        restaurant.infoWindow.open({ anchor: restaurant.marker, map: this.map });
      });
    });
  }

  setMarker(marker: any) {
    marker.setMap(this.map);
  }

  setMarkers() {
    this.openRestaurants.forEach((restaurant) => {
      restaurant.marker.setMap(this.map);
    });
    console.log('clicked');
  }

  removeMarkers() {
    this.openRestaurants.forEach((restaurant) => {
      restaurant.marker.setMap(null);
    });
  }
}

export default MapsService;
