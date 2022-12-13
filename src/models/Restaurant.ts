/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Coordinates from './Coordinates';

declare const google: any;

interface IInfoWindow {
  open: (map: any, marker: any) => void;
  close: (map: any, marker: any) => void;
}

class Restaurant {
  info: any;

  marker: any;

  infoWindow: any;

  details: any;

  isOpen: boolean;

  constructor(info: any, coordinates: Coordinates) {
    this.info = info;
    this.createMarker();
    this.createInfoWindow();
    this.isOpen = false;
  }

  createMarker() {
    const coords = this.info.geometry.location;
    const lat: number = coords.lat();
    const lng: number = coords.lng();
    const marker = new google.maps.Marker({
      position: { lat, lng },
    });
    this.marker = marker;
  }

  createInfoWindow() {
    const infoWindow: IInfoWindow = new google.maps.InfoWindow({
      content: `<h2 style="color: black">${this.info.name as string}</h2>`,
    });
    this.infoWindow = infoWindow;
  }
}

export default Restaurant;
