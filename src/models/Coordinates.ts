class Coordinates {
  lat: number;

  lng: number;

  constructor() {
    this.lat = 0;
    this.lng = 0;
  }

  getUserCoordinates(): Promise<true | null> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          resolve(true);
        },
        (error) => {
          if (error.code === 1) {
            resolve(null);
            return;
          }
          reject(console.error(error.message));
        },
      );
    });
  }

  setCoordinates(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }
}

export default Coordinates;
