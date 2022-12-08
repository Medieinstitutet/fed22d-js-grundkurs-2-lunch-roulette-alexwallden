/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import getUserCoordinates from './inventory/userCoordinates';
import Coordinates from './models/Coordinates';
// import mockRestaurants from './inventory/mockRestaurants.json';

declare global {
  interface Window {
    initMap: () => void;
  }
}

let map: any;
declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');
const button: HTMLElement | null = document.querySelector('#btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
let radius = 500;
let userCoordinates: Coordinates | null = null;
const markers: any[] = [];

rangeInputs.forEach((input) => {
  input.addEventListener('click', () => {
    const checkedRadio: HTMLOptionElement | null = document.querySelector('input[name="range-input"]:checked');
    if (checkedRadio) {
      radius = Number(checkedRadio.value);
    }
  });
});

function removeMarkers() {
  markers.forEach((element) => {
    element.setMap(null);
  });
  markers.splice(1);
  markers[0].setMap(map);
  console.log(markers);
}

removeButton?.addEventListener('click', removeMarkers);

function retrieveRestaurants() {
  const request = {
    location: userCoordinates,
    radius,
    type: ['restaurant'],
  };

  console.log(radius);

  // Skriv ut resultaten på kartan
  function handleResults(results: string | any[], status: any) {
    if (status === google.maps.places.PlacesServiceStatus.OK && markers.length > 0) {
      console.log(markers);
      markers.splice(1);
      console.log(markers);
      console.log(results);
      for (let i = 0; i < results.length; i++) {
        // printa en kartnål
        const restaurant = results[i];
        const lat: number = restaurant.geometry.location.lat();
        // const { lat }: { lat: number } = restaurant.geometry.location;
        const lng: number = restaurant.geometry.location.lng();
        // const { lng }: { lng: number } = restaurant.geometry.location;
        const position = new Coordinates(lat, lng);
        const marker = new google.maps.Marker({
          position,
          // map,
        });
        markers.push(marker);
      }
      markers.forEach((element) => {
        element.setMap(map);
      });
      switch (radius) {
        case 500:
          map.setZoom(15);
          break;
        case 1000:
          map.setZoom(14);
          break;
        case 3000:
          map.setZoom(12);
          break;
        default:
          map.setZoom(12);
          break;
      }
    }
  }

  // Gör en sökning… vänta på resultaten
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, handleResults);
  // handleResults(mockRestaurants, 'OK');
}

button?.addEventListener('click', () => {
  retrieveRestaurants();
});

function initMap(): void {
  const mapContainer: HTMLDivElement | null = document.querySelector('#map');
  map = new google.maps.Map(mapContainer, {
    zoom: 15,
    center: userCoordinates,
  });
  const marker = new google.maps.Marker({
    position: userCoordinates,
    // map,
  });
  markers.push(marker);
  markers.forEach((element) => {
    element.setMap(map);
  });
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
    console.log('Appen startad!');
    if (userCoordinates) {
      console.log(`Din position är: ${userCoordinates.lat} lat, ${userCoordinates.lng} lng`);
    }
  })
  .catch((err) => {
    console.error(err);
  });
