/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  restaurants: Restaurant[] = [];

  openRestaurants: Restaurant[] = [];

  closedRestaurants: Restaurant[] = [];

  map: any;

  retrievePromises: Promise<any>[] = [];

  constructor(mapContainer: HTMLDivElement | null) {
    this.initMap(mapContainer);
  }

  initMap(mapContainer: HTMLDivElement | null): void {
    this.map = new google.maps.Map(mapContainer, {
      zoom: 4,
      center: { lat: 63.3297408, lng: 18.0158464 },
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
          this.restaurants = [];
          results.forEach((result) => {
            if (result.business_status === 'OPERATIONAL') {
              const restaurant = new Restaurant(this.map, result);
              this.restaurants.push(restaurant);
            }
          });
          await this.retrieveDetails();
          switch (radius) {
            case 500:
              this.map.setZoom(13);
              break;
            case 1000:
              this.map.setZoom(12);
              break;
            case 3000:
              this.map.setZoom(11);
              break;
            default:
              this.map.setZoom(11);
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
    for (let index = 0; index < this.restaurants.length; index++) {
      const restaurant = this.restaurants[index];
      const request = { placeId: restaurant.info.place_id, fields: ['name', 'opening_hours', 'utc_offset_minutes', 'website'] };
      const service = new google.maps.places.PlacesService(this.map);
      const retrievePromise: Promise<any> = new Promise((resolve) => {
        service.getDetails(request, (place: any, status: any) => {
          console.log('Status:', status);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            restaurant.details = place;
          } else if (!status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(status);
          }
          resolve(place);
        });
      });
      this.retrievePromises.push(retrievePromise);
      await wait(300);
    }
    await this.filterOpenRestaurants();
  }

  async filterOpenRestaurants() {
    await Promise.allSettled(this.retrievePromises)
      .then((responses) => {
        responses.forEach((response) => {
          console.log(response);
        });
        for (let index = 0; index < this.restaurants.length; index++) {
          const restaurant = this.restaurants[index];
          if (restaurant.details.opening_hours) {
            const isOpenNow = restaurant.details.opening_hours.isOpen();
            if (isOpenNow) {
              restaurant.changeOpenStatus();
              this.openRestaurants.push(restaurant);
            } else if (!isOpenNow) {
              this.closedRestaurants.push(restaurant);
            }
          } else {
            this.closedRestaurants.push(restaurant);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  attachInfoWindows() {
    this.restaurants.forEach((restaurant) => {
      restaurant.marker.addListener('click', () => {
        restaurant.toggleInfoWindow();
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
  }

  removeMarkers() {
    this.openRestaurants.forEach((restaurant) => {
      restaurant.marker.setMap(null);
    });
  }

  getOpenRestaurants() {
    return this.openRestaurants;
  }

  clearRestaurants() {
    this.restaurants = [];
    this.openRestaurants = [];
    this.closedRestaurants = [];
    this.retrievePromises = [];
  }
}

export default MapsService;
