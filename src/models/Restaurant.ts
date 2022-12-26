/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

declare const google: any;

interface IInfoWindow {
  content: string;
  open: (map: any, marker: any) => void;
  close: (map: any, marker: any) => void;
  setContent: (content: string) => void;
}

class Restaurant {
  info: any;

  marker: any;

  infoWindow: any;

  details: any;

  coordinates: { lat: number; lng: number };

  distance: number;

  id: number;

  isOpen: boolean;

  constructor(info: any) {
    this.distance = 0;
    this.info = info;
    this.coordinates = { lat: this.info.geometry.location.lat(), lng: this.info.geometry.location.lng() };
    this.createMarker();
    this.isOpen = false;
    this.id = Math.floor(Math.random() * 100_000);
  }

  createMarker() {
    const marker = new google.maps.Marker({
      position: this.coordinates,
    });
    this.marker = marker;
  }

  createInfoWindow(distanceUnit: string) {
    const { website }: { website: string } = this.details;
    const infoWindow: IInfoWindow = new google.maps.InfoWindow({
      content: /* html */`
      <h2 style="color: black">${this.info.name as string}</h2>
      <p>Avstånd: ${this.distance}${distanceUnit}</p>
      `,
    });
    if (website) {
      console.log(true);
      infoWindow.setContent(/* html */ `
      ${infoWindow.content}
      <br>
      <a href="${website}" rel="noopener noreferrer" target="_blank">Hemsida</a>
      `);
    }
    this.infoWindow = infoWindow;
  }

  changeOpenStatus() {
    this.isOpen = true;
  }

  calculateDistance(userMarker: any) {
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
      this.createInfoWindow('m');
    } else if (d >= 1) {
      this.distance = Math.round(d * 10) / 10;
      this.createInfoWindow('km');
    }
  }
}

export default Restaurant;
