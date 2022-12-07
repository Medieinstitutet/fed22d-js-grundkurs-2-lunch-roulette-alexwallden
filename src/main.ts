/* eslint-disable max-len */
/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import getUserCoordinates from './inventory/userCoordinates';
import Coordinates from './models/Coordinates';

declare global {
  interface Window {
    initMap: () => void;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any;
const app: HTMLDivElement | null = document.querySelector('#app');

let userCoordinates: Coordinates | null = null;

function retrieveRestaurants(radius: string) {
  const request = {
    location: userCoordinates,
    radius,
    type: ['restaurant'],
  };

  // Skriv ut resultaten på kartan
  function handleResults(results: string | any[], status: any) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        // printa en kartnål
        console.log(results[i]);
        const restaurant = results[i];
        const position = new Coordinates(restaurant.geometry.location.lat() as number, restaurant.geometry.location.lng() as number);
        new google.maps.Marker({
          position,
          map,
        });
      }
    }
  }

  // Gör en sökning… vänta på resultaten
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, handleResults);
}

function initMap(): void {
  map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
    zoom: 16,
    center: userCoordinates,
  });
  // eslint-disable-next-line no-new
  new google.maps.Marker({
    position: userCoordinates,
    map,
  });
  retrieveRestaurants('1000');
}

const run = async () => {
  userCoordinates = await getUserCoordinates();
  if (userCoordinates && app) {
    app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
    window.initMap = initMap;
    initMap();
  } else if (app) {
    app.innerHTML = 'Du behöver aktivera platstjänster';
  }
};

run()
  .then(() => {
    console.log('Appen startad');
  })
  .catch((err) => {
    console.error(err);
  });
