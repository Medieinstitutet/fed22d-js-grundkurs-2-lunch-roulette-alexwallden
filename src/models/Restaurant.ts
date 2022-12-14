/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Coordinates from './Coordinates';

declare const google: any;

interface IInfoWindow {
  content: string;
  windowOpen: boolean;
  open: (map: any, marker: any) => void;
  close: (map: any, marker: any) => void;
  setContent: (content: string) => void;
}

class Restaurant {
  map: any;

  info: any;

  marker: any;

  infoWindow: any;

  details: any;

  coordinates: { lat: number; lng: number };

  distance: number;

  id: number;

  isOpen: boolean;

  constructor(map: any, info: any) {
    this.map = map;
    this.distance = 0;
    this.info = info;
    this.coordinates = { lat: this.info.geometry.location.lat(), lng: this.info.geometry.location.lng() };
    this.createMarker();
    this.isOpen = false;
    this.id = Math.floor(Math.random() * 1_000_000);
  }

  createMarker() {
    const marker = new google.maps.Marker({
      position: this.coordinates,
      title: this.info.name,
    });
    this.marker = marker;
  }

  createInfoWindow(distanceUnit: string, userCoordinates: Coordinates | null) {
    const { website }: { website: string } = this.details;
    const infoWindow: IInfoWindow = new google.maps.InfoWindow({
      content: /* html */`
      <h2 style="color: black">${this.info.name as string}</h2>
      <p>Avstånd: ${this.distance}${distanceUnit}</p>
      <a rel="noopener noreferrer" target="_blank" href="https://www.google.com/maps/dir/${userCoordinates!.lat},${userCoordinates!.lng}/${this.coordinates.lat},${this.coordinates.lng}/">Vägbeskrivning</a>
      `,
    });
    if (website) {
      infoWindow.setContent(/* html */ `
      ${infoWindow.content}
      <br>
      <a href="${website}" rel="noopener noreferrer" target="_blank">Hemsida</a>
      `);
    }
    infoWindow.windowOpen = false;
    this.infoWindow = infoWindow;
  }

  changeOpenStatus() {
    this.isOpen = true;
  }

  calculateDistance(userMarker: any, userCoordinates: Coordinates | null) {
    const R = 6371.0710; // Radius of the Earth in miles
    const rlat1 = userMarker.position.lat() * (Math.PI / 180); // Convert degrees to radians
    const rlat2 = this.marker.position.lat() * (Math.PI / 180); // Convert degrees to radians
    const difflat = rlat2 - rlat1; // Radian difference (latitudes)
    const difflon = (this.marker.position.lng() - userMarker.position.lng()) * (Math.PI / 180); // Radian difference (longitudes)

    const d = 2 * R * Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2),
      ),
    );
    if (d < 1) {
      this.distance = Math.floor(d * 1000);
      this.createInfoWindow('m', userCoordinates);
    } else if (d >= 1) {
      this.distance = Math.round(d * 10) / 10;
      this.createInfoWindow('km', userCoordinates);
    }
  }

  toggleInfoWindow(bool ?: boolean) {
    if (typeof bool === 'undefined') {
      this.infoWindow.windowOpen = !this.infoWindow.windowOpen;
    } else {
      this.infoWindow.windowOpen = bool;
    }
    if (this.infoWindow.windowOpen) {
      this.infoWindow.open({ anchor: this.marker, map: this.map });
    } else {
      this.infoWindow.close();
    }
  }
}

export default Restaurant;
