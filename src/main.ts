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

interface IDetailWindow {
  open: (map: any, marker: any) => void;
  close: (map: any, marker: any) => void;
}

declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');
const mapContainer: HTMLDivElement | null = document.querySelector('#map');
const startButton: HTMLElement | null = document.querySelector('#start-btn');
const displayButton: HTMLElement | null = document.querySelector('#display-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
const restaurantMarkers: any[] = [];
const mapsService: MapsService = new MapsService(mapContainer);

let restaurants: any[] = [];
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
  const { target } = e;
  if (target) {
    radius = Number((target as HTMLOptionElement).value);
  }
}

function openDetailWindow(windowToOpen: IDetailWindow, marker: any) {
  windowToOpen.open(mapsService.map, marker);
}

// function closeDetailWindow(windowToClose: IDetailWindow, marker: any) {
//   windowToClose.close(map, marker);
// }

function removeMarkers() {
  restaurantMarkers.forEach((element) => {
    element.setMap(null); // Removes the marker from map
  });
  console.log(restaurantMarkers);
}

function createRestaurantMarkers(restaurantsArr: any[]) {
  restaurantMarkers.length = 0; // Clear restaurantMarkers
  restaurantsArr.forEach((restaurant) => {
    if (restaurant.business_status === 'OPERATIONAL' && restaurant.opening_hours) {
      const isOpenNow = restaurant.opening_hours.open_now;
      if (isOpenNow) {
        const lat: number = restaurant.geometry.location.lat();
        const lng: number = restaurant.geometry.location.lng();
        const position = new Coordinates();
        position.setCoordinates(lat, lng);
        const marker = new google.maps.Marker({
          position,
        });
        const detailWindow: IDetailWindow = new google.maps.InfoWindow({
          content: `<h2 style="color: black">${restaurant.name as string}</h2>`,
        });
        marker.addListener('click', () => openDetailWindow(detailWindow, marker));
        restaurantMarkers.push(marker);
      }
    }
  });
  switch (radius) {
    case 500:
      mapsService.map.setZoom(15);
      break;
    case 1000:
      mapsService.map.setZoom(14);
      break;
    case 3000:
      mapsService.map.setZoom(12);
      break;
    default:
      mapsService.map.setZoom(12);
      break;
  }
}

function startApp() {
  console.log('Startar appen');
  (async () => {
    userCoordinates = new Coordinates();
    await userCoordinates.getUserCoordinates();
    await mapsService.retrieveRestaurants(userCoordinates, radius);
  })()
    .then(() => {
      console.log('Koordinater hämtade!');
      if (userCoordinates && app) {
        restaurants = [...mapsService.restaurants];
        app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
        createUserMarker();
        mapsService.setMarker(userMarker);
        // window.initMap = initMap;
        mapsService.setMarkers(restaurantMarkers);
        mapsService.map.setZoom(15);
        mapsService.map.setCenter(userCoordinates);
        createRestaurantMarkers(restaurants);
      } else if (app) {
        app.innerHTML = 'Du behöver aktivera platstjänster';
      }
    })
    .catch((err) => {
      console.log('Något gick fel');
      console.error(err);
    });
}

function lunchRoulette() {
  const randomIndex: number = Math.floor(Math.random() * (restaurantMarkers.length - 1));
  console.log(randomIndex);
  randomRestaurantMarker = restaurantMarkers[randomIndex];
  removeMarkers();
  console.log(randomRestaurantMarker);
  mapsService.setMarkers([randomRestaurantMarker]);
}

startButton?.addEventListener('click', startApp);

displayButton?.addEventListener('click', () => {
  mapsService.setMarkers(restaurantMarkers);
});

rouletteButton?.addEventListener('click', lunchRoulette);

removeButton?.addEventListener('click', removeMarkers);

rangeInputs.forEach((input) => {
  input.addEventListener('click', setRadius);
});
