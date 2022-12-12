/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import getUserCoordinates from './inventory/getUserCoordinates';
import Coordinates from './models/Coordinates';
import MapsService from './services/mapsService';
// import mockRestaurants from './inventory/mockRestaurants.json';

declare global {
  interface Window {
    initMap: () => void;
  }
}

interface IDetailWindow {
  open: (arg0: any, arg1: any) => void;
  close: (arg0: any, arg1: any) => void;
}

declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');
const startButton: HTMLElement | null = document.querySelector('#start-btn');
const retrieveButton: HTMLElement | null = document.querySelector('#retrieve-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
const restaurantMarkers: any[] = [];
const mapsService = new MapsService();

let userMarker: any;
let map: any;
let radius = 500;
let userCoordinates: Coordinates | null = null;
let randomRestaurantMarker: any;

// function initMap(): void {
//   const mapContainer: HTMLDivElement | null = document.querySelector('#map');
//   map = new google.maps.Map(mapContainer, {
//     zoom: 6, // TODO ändra koordinater
//     center: { lat: 59.3297408, lng: 18.0158464 },
//   });
// }

function createUserMarker() {
  const marker = new google.maps.Marker({
    position: userCoordinates,
    // map,
  });
  userMarker = marker;
}

function setUserMarker() {
  userMarker.setMap(map);
}

function setRadius(e: Event) {
  const { target } = e;
  if (target) {
    radius = Number((target as HTMLOptionElement).value);
    console.log(radius);
  }
}

rangeInputs.forEach((input) => {
  input.addEventListener('click', setRadius);
});

function setMarkers(array: any[]) {
  array.forEach((element) => {
    element.setMap(map);
  });
}

function openDetailWindow(windowToOpen: IDetailWindow, marker: any) {
  windowToOpen.open(map, marker);
}

// function closeDetailWindow(windowToClose: IDetailWindow, marker: any) {
//   windowToClose.close(map, marker);
// }

function removeMarkers() {
  restaurantMarkers.forEach((element) => {
    element.setMap(null); // Remove the marker from map
  });
  console.log(restaurantMarkers);
}

// Skriv ut resultaten på kartan
function renderRestaurants(results: any[]) {
  removeMarkers();
  console.log(restaurantMarkers);
  console.log(results);
  results.forEach((restaurant) => {
    // printa en kartnål
    if (restaurant.business_status === 'OPERATIONAL' && restaurant.opening_hours) {
      const isOpenNow = restaurant.opening_hours.open_now;
      if (isOpenNow) {
        const lat: number = restaurant.geometry.location.lat();
        const lng: number = restaurant.geometry.location.lng();
        const position = new Coordinates(lat, lng);
        const marker = new google.maps.Marker({
          position,
          // map,
          // icon: restaurant.icon,
        });
        const detailWindow: IDetailWindow = new google.maps.InfoWindow({
          content: `<h2 style="color: black">${restaurant.name as string}</h2>`,
        });
        console.log(detailWindow);
        marker.addListener('click', () => openDetailWindow(detailWindow, marker));
        marker.setMap(map); // Render marker on map
      }
    }
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

function startApp() {
  console.log('Startar appen');
  (async () => {
    userCoordinates = await getUserCoordinates();
    console.log(userCoordinates);
  })()
    .then(() => {
      console.log('Koordinater hämtade!');
      if (userCoordinates && app) {
        app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
        createUserMarker();
        setUserMarker();
        // window.initMap = initMap;
        setMarkers(restaurantMarkers);
        mapsService.map.setZoom(15);
        mapsService.map.setCenter(userCoordinates);
        console.log(restaurantMarkers);
        const request = {
          location: userCoordinates,
          radius,
          type: ['restaurant'],
        };
        // Gör en sökning… vänta på resultaten
        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, renderRestaurants);
      } else if (app) {
        app.innerHTML = 'Du behöver aktivera platstjänster';
      }
    })
    .catch((err) => {
      console.log('Något gick fel');
      console.error(err);
    });
}

function retrieveRestaurants() {
  return new Promise((resolve) => {
    const request = {
      location: userCoordinates,
      radius,
      type: ['restaurant'],
    };
    const service: any = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results: any[], status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        resolve(null);
      }
    });
  });
}

startButton?.addEventListener('click', startApp);

removeButton?.addEventListener('click', removeMarkers);

async function displayRestaurants() {
  const restaurants = await retrieveRestaurants();
  if (restaurants) {
    renderRestaurants(restaurants as any[]);
  } else {
    console.log('Något gick fel när restaurangerna skulle hämtas');
  }
}

retrieveButton?.addEventListener('click', () => {
  setMarkers(restaurantMarkers);
});

function lunchRoulette() {
  // retrieveRestaurants();
  const randomIndex: number = Math.floor(Math.random() * (restaurantMarkers.length - 1));
  console.log(randomIndex);
  randomRestaurantMarker = restaurantMarkers[randomIndex];
  removeMarkers();
  console.log(restaurantMarkers);
  randomRestaurantMarker.setMap(map);
}

rouletteButton?.addEventListener('click', lunchRoulette);

mapsService.initMap();
