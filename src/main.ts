/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import Coordinates from './models/Coordinates';
import MapsService from './services/mapsService';
// import mockRestaurants from './inventory/mockRestaurants.json';

declare global {
  interface Window {
    initMap: () => void;
  }
}

declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');
const mapContainer: HTMLDivElement | null = document.querySelector('#map');
const startButton: HTMLElement | null = document.querySelector('#start-btn');
const displayButton: HTMLElement | null = document.querySelector('#display-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
const mapsService: MapsService = new MapsService(mapContainer);

let userCoordinatesSuccess: any;
let userMarker: any;
let radius = 500;
let userCoordinates: Coordinates | null = null;
let randomRestaurantMarker: any;

function createUserMarker() {
  const marker = new google.maps.Marker({
    position: userCoordinates,
  });
  userMarker = marker;
}

function setRadius(e: Event) {
  mapsService.removeMarkers();
  const { target } = e;
  if (target) {
    radius = Number((target as HTMLOptionElement).value);
    (async () => {
      await mapsService.retrieveRestaurants(userCoordinates as Coordinates, radius);
    })()
      .then(() => {
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

rangeInputs.forEach((input) => {
  input.addEventListener('click', setRadius);
});

function startApp() {
  console.log('Startar appen');
  (async () => {
    userCoordinates = new Coordinates();
    userCoordinatesSuccess = await userCoordinates.getUserCoordinates();
    await mapsService.retrieveRestaurants(userCoordinates, radius);
  })()
    .then(() => {
      if (userCoordinatesSuccess && app && userCoordinates) {
        console.log('Koordinater hämtade!');
        // restaurants = [...mapsService.openRestaurants];
        app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
        createUserMarker();
        mapsService.setMarker(userMarker);
        mapsService.map.setZoom(15);
        mapsService.map.setCenter(userCoordinates);
        mapsService.attachInfoWindows();
      } else if (app && !userCoordinatesSuccess) {
        app.innerHTML = 'Du behöver aktivera platstjänster';
      }
    })
    .catch((err) => {
      console.log('Något gick fel');
      console.error(err);
    });
}

function lunchRoulette() {
  randomRestaurantMarker.setMap(null);
  const randomIndex: number = Math.floor(Math.random() * (mapsService.openRestaurants.length - 1));
  console.log(randomIndex);
  const randomRestaurant = mapsService.openRestaurants[randomIndex];
  const coords = randomRestaurant.info.geometry.location;
  const lat: number = coords.lat();
  const lng: number = coords.lng();
  randomRestaurantMarker = new google.maps.Marker({
    position: { lat, lng },
  });
  mapsService.removeMarkers();
  mapsService.setMarker(randomRestaurantMarker);
}

startButton?.addEventListener('click', startApp);

displayButton?.addEventListener('click', () => {
  mapsService.setMarkers();
});

rouletteButton?.addEventListener('click', lunchRoulette);

removeButton?.addEventListener('click', () => mapsService.removeMarkers());
