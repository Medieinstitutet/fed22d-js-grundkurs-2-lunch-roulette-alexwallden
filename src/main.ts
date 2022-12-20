/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Coordinates from './models/Coordinates';
import MapsService from './services/mapsService';

gsap.registerPlugin(TextPlugin);
declare global {
  interface Window {
    initMap: () => void;
  }
}

declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');
const mapContainer: HTMLDivElement | null = document.querySelector('#map');
const restaurantsList: HTMLUListElement | null = document.querySelector('#restaurants-list');
const loadingModal: HTMLDivElement | null = document.querySelector('.loading-modal');
const modalText: HTMLHeadingElement | null = document.querySelector('#modal-text');
const controls: HTMLDivElement | null = document.querySelector('.controls');
const startButton: HTMLElement | null = document.querySelector('#start-btn');
const displayButton: HTMLElement | null = document.querySelector('#display-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
const form: HTMLFormElement | null = document.querySelector('#form');
const mapsService: MapsService = new MapsService(mapContainer);
const timeLine = gsap.timeline({ repeat: -1 });
const toggleShowArray: any[] = [mapContainer, startButton, controls];

let userCoordinatesSuccess: any;
let userMarker: any;
let radius = 500;
let userCoordinates: Coordinates | null = null;
let randomRestaurantMarker: any;
let showModal = false;

function toggleModal() {
  showModal = !showModal;
  loadingModal?.classList.toggle('hidden');
  if (showModal) {
    timeLine.play();
    timeLine.to('.spinner', {
      rotate: 360,
      repeat: -1,
      duration: 2,
      ease: 'none',
    });
  } else {
    timeLine.pause();
  }
}

function setLoadingText(text: string) {
  if (modalText) { modalText.innerHTML = `${text}<span class="loading-dots"></span>`; }
  timeLine.to('.loading-dots', {
    duration: 2, repeat: -1, text: '...', ease: 'none', onComplete: () => { timeLine.to('.loading-dots', { opacity: 0, duration: 3 }); },
  }, '<');
}

function createUserMarker() {
  const marker = new google.maps.Marker({
    position: userCoordinates,
  });
  userMarker = marker;
}

function showOrHide(elementsArray: any[]) {
  elementsArray.forEach((element: any) => {
    element.classList.toggle('hidden');
    // if (element.classList.contains('hidden')) {
    //   element.classList.remove('hidden');
    // } else {
    //   element.classList.add('hidden');
    // }
  });
}

console.log(startButton?.classList.contains('start-btn'));

function startApp() {
  mapsService.clearRestaurants();
  showOrHide(toggleShowArray);
  if (restaurantsList) { restaurantsList.innerHTML = ''; }
  console.log('Startar appen');
  (async () => {
    toggleModal();
    setLoadingText('Hittar din plats');
    userCoordinates = new Coordinates();
    userCoordinatesSuccess = await userCoordinates.getUserCoordinates();
    if (userCoordinatesSuccess && app && userCoordinates) {
      console.log('Koordinater hämtade!');
      app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
    }
    setLoadingText('Hämtar restauranger i närheten');
    await mapsService.retrieveRestaurants(userCoordinates, radius);
  })()
    .then(() => {
      if (userCoordinatesSuccess && app && userCoordinates && restaurantsList) {
        createUserMarker();
        mapsService.setMarker(userMarker);
        mapsService.map.setCenter(userCoordinates);
        mapsService.attachInfoWindows();
        const restaurants = mapsService.getOpenRestaurants();
        restaurants.forEach((restaurant) => {
          restaurant.calculateDistance(userMarker);
          const distanceUnit: string = restaurant.distance > 10 ? 'm' : 'km';
          restaurantsList.innerHTML += /* html */ `
          <li data-id="${restaurant.id}">${restaurant.info.name} Avstånd: ${restaurant.distance}${distanceUnit}</li>`;
        });
        mapsService.setMarkers();
        toggleModal();
      } else if (app && !userCoordinatesSuccess) {
        app.innerHTML = 'Du behöver aktivera platstjänster';
      }
    })
    .catch((err) => {
      console.log('Något gick fel');
      console.error(err);
    });
}

function setRadius(e: Event) {
  const { target } = e;
  if (target) {
    mapsService.removeMarkers();
    if (randomRestaurantMarker) {
      randomRestaurantMarker.setMap(null);
    }
    radius = Number((target as HTMLOptionElement).value);
    if (userCoordinates) {
      startApp();
    }
  }
}

rangeInputs.forEach((input) => {
  input.addEventListener('click', setRadius);
});

function lunchRoulette() {
  if (randomRestaurantMarker) {
    randomRestaurantMarker.setMap(null);
  }
  const randomIndex: number = Math.floor(Math.random() * (mapsService.openRestaurants.length - 1));
  console.log(randomIndex);
  const randomRestaurant = mapsService.getOpenRestaurants()[randomIndex];
  randomRestaurantMarker = randomRestaurant.marker;
  mapsService.removeMarkers();
  mapsService.setMarker(randomRestaurantMarker);
}

startButton?.addEventListener('click', startApp);

displayButton?.addEventListener('click', () => {
  mapsService.setMarkers();
});

rouletteButton?.addEventListener('click', lunchRoulette);

removeButton?.addEventListener('click', () => mapsService.removeMarkers());
