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
// import mockRestaurants from './inventory/mockRestaurants.json';

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
const showBtn: HTMLButtonElement | null = document.querySelector('#show');
const startButton: HTMLElement | null = document.querySelector('#start-btn');
const displayButton: HTMLElement | null = document.querySelector('#display-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
const mapsService: MapsService = new MapsService(mapContainer);
const timeLine = gsap.timeline({ repeat: -1 });

let userCoordinatesSuccess: any;
let userMarker: any;
let radius = 500;
let userCoordinates: Coordinates | null = null;
let randomRestaurantMarker: any;
let showModal = false;

function toggleModal() {
  showModal = !showModal;
  if (showModal) {
    timeLine.play();
    loadingModal?.classList.remove('hidden');
    timeLine.to('.spinner', {
      rotate: 360,
      repeat: -1,
      duration: 2,
      ease: 'none',
    });
  } else {
    loadingModal?.classList.add('hidden');
    timeLine.pause();
  }
}

function setLoadingText(text: string) {
  if (modalText) { modalText.innerHTML = `${text}<span class="loading-dots"></span>`; }
  timeLine.to('.loading-dots', {
    duration: 2, repeat: -1, text: '...', ease: 'none', onComplete: () => { timeLine.to('.loading-dots', { opacity: 0, duration: 3 }); },
  }, '<');
}

showBtn?.addEventListener('click', toggleModal);

function createUserMarker() {
  const marker = new google.maps.Marker({
    position: userCoordinates,
  });
  userMarker = marker;
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
      (async () => {
        await mapsService.retrieveRestaurants(userCoordinates, radius);
      })()
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

rangeInputs.forEach((input) => {
  input.addEventListener('click', setRadius);
});

function startApp() {
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
          <li>${restaurant.info.name} Avstånd: ${restaurant.distance}${distanceUnit}</li>`;
        });
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

function lunchRoulette() {
  if (randomRestaurantMarker) {
    randomRestaurantMarker.setMap(null);
  }
  const randomIndex: number = Math.floor(Math.random() * (mapsService.restaurants.length - 1));
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
