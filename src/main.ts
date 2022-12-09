/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import getUserCoordinates from './inventory/getUserCoordinates';
import Coordinates from './models/Coordinates';
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

let map: any;
declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');
const retrieveButton: HTMLElement | null = document.querySelector('#retrieve-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
let radius = 500;
let userCoordinates: Coordinates | null = null;
const markers: any[] = [];
let randomRestaurantMarker: any;

rangeInputs.forEach((input) => {
  input.addEventListener('click', () => {
    const checkedRadio: HTMLOptionElement | null = document.querySelector('input[name="range-input"]:checked');
    if (checkedRadio) {
      radius = Number(checkedRadio.value);
    }
  });
});

function setMarkers(array: any[]) {
  array.forEach((element) => {
    element.setMap(map);
  });
}

function removeMarkers() {
  markers.slice(1).forEach((element) => {
    element.setMap(null); // Remove the marker from map
  });
  markers.splice(1);
  console.log(markers);
}

function openDetailWindow(windowToOpen: IDetailWindow, marker: any) {
  windowToOpen.open(map, marker);
}

function closeDetailWindow(windowToClose: IDetailWindow, marker: any) {
  windowToClose.close(map, marker);
}

// Skriv ut resultaten på kartan
function handleResults(results: string | any[], status: any) {
  if (status === google.maps.places.PlacesServiceStatus.OK && markers.length > 0) {
    removeMarkers();
    console.log(markers);
    console.log(results);
    for (let i = 0; i < results.length; i++) {
      // printa en kartnål
      const restaurant = results[i];
      if (restaurant.business_status === 'OPERATIONAL' && restaurant.opening_hours) {
        const isOpenNow = restaurant.opening_hours.open_now;
        if (isOpenNow) {
          const lat: number = restaurant.geometry.location.lat();
          // const { lat }: { lat: number } = restaurant.geometry.location;
          const lng: number = restaurant.geometry.location.lng();
          // const { lng }: { lng: number } = restaurant.geometry.location;
          const position = new Coordinates(lat, lng);
          const marker = new google.maps.Marker({
            position,
            // map,
            // icon: restaurant.icon,
          });
          const detailWindow: IDetailWindow = new google.maps.InfoWindow({
            content: `<h2 style="color: black">${restaurant.name as string}</h2>`,
          });
          marker.addListener('click', () => openDetailWindow(detailWindow, marker));
          marker.addListener('click', () => closeDetailWindow(detailWindow, marker));
          markers.push(marker);
        }
      }
    }
    setMarkers(markers);
  }
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

removeButton?.addEventListener('click', removeMarkers);

function retrieveRestaurants() {
  removeMarkers();
  const request = {
    location: userCoordinates,
    radius,
    type: ['restaurant'],
  };

  // Gör en sökning… vänta på resultaten
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, handleResults);
  // handleResults(mockRestaurants, 'OK');
}

retrieveButton?.addEventListener('click', retrieveRestaurants);

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
  setMarkers(markers);
}

function lunchRoulette() {
  retrieveRestaurants();
  setTimeout(() => {
    const randomIndex: number = Math.floor(Math.random() * (markers.length - 1));
    console.log(randomIndex);
    randomRestaurantMarker = markers[randomIndex];
    removeMarkers();
    console.log(markers);
    randomRestaurantMarker.setMap(map);
  }, 1000);
}

rouletteButton?.addEventListener('click', lunchRoulette);

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
