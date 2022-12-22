/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-param-reassign */
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
import wait from './inventory/helpers';

gsap.registerPlugin(TextPlugin);
declare global {
  interface Window {
    initMap: () => void;
  }
}

declare const google: any;
const mapContainer: HTMLDivElement | null = document.querySelector('#map');
const restaurantsList: HTMLUListElement | null = document.querySelector('#restaurants-list');
const loadingModal: HTMLDivElement | null = document.querySelector('.loading-modal');
const modalText: HTMLHeadingElement | null = document.querySelector('#modal-text');
const spinner: HTMLDivElement | null = document.querySelector('.spinner');
const controls: HTMLDivElement | null = document.querySelector('.controls');
const startButtonContainer: HTMLDivElement | null = document.querySelector('.start-btn-container');
const startButton: HTMLElement | null = document.querySelector('#start-btn');
const displayButton: HTMLElement | null = document.querySelector('#display-btn');
const removeButton: HTMLElement | null = document.querySelector('#remove-btn');
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
// const form: HTMLFormElement | null = document.querySelector('#form');
const mapsService: MapsService = new MapsService(mapContainer);
const timeLine = gsap.timeline({ repeat: -1 });
const toggleShowArray: any[] = [mapContainer, startButtonContainer, controls];

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
  if (modalText) {
    modalText.innerHTML = `${text}<span class="loading-dots"></span>`;
  }
  timeLine.to(
    '.loading-dots',
    {
      duration: 2,
      repeat: -1,
      text: '...',
      ease: 'none',
      onComplete: () => {
        timeLine.to('.loading-dots', { opacity: 0, duration: 3 });
      },
    },
    '<',
  );
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
  if (restaurantsList) {
    restaurantsList.innerHTML = '';
  }
  console.log('Startar appen');
  (async () => {
    toggleModal();
    if (!userCoordinates) {
      showOrHide(toggleShowArray);
      setLoadingText('Hittar din plats');
      userCoordinates = new Coordinates();
      userCoordinatesSuccess = await userCoordinates.getUserCoordinates();
    }
    if (userCoordinatesSuccess && userCoordinates) {
      console.log('Koordinater hämtade!');
    }
    setLoadingText('Hämtar restauranger i närheten');
    await mapsService.retrieveRestaurants(userCoordinates, radius);
  })()
    .then(() => {
      if (userCoordinatesSuccess && userCoordinates && restaurantsList) {
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
      } else if (!userCoordinatesSuccess) {
        spinner?.classList.toggle('hidden');
        timeLine.pause();
        setLoadingText('Du behöver aktivera platstjänster');
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
  input.addEventListener('click', setRadius, { passive: true });
});

async function lunchRoulette(): Promise<any> {
  if (randomRestaurantMarker) {
    randomRestaurantMarker.setMap(null);
  }
  const listItems: HTMLLIElement[] | null = Array.from(document.querySelectorAll('#restaurants-list li'));
  const randomIndex: number = Math.floor(Math.random() * (mapsService.openRestaurants.length - 1));
  console.log(randomIndex);
  const randomRestaurant = mapsService.getOpenRestaurants()[randomIndex];
  randomRestaurantMarker = randomRestaurant.marker;
  mapsService.removeMarkers();
  let previousListItem: HTMLLIElement | null = null;
  console.log(mapsService.getOpenRestaurants());
  console.log(listItems);

  if (listItems) {
    let counter = 0;
    let waitTime = 30;
    for (let i = 0; i < listItems?.length;) {
      const listItem = listItems[i];
      await wait(waitTime);
      if (previousListItem) { previousListItem.style.color = 'white'; }
      listItem.style.color = 'red';
      previousListItem = listItem;
      i += 1;
      waitTime += 7;
      if (i === listItems.length) {
        i = 0;
        counter += 1;
        // waitTime += 50;
      }
      if (counter === 3 && i === randomIndex + 1) {
        i = listItems.length;
        mapsService.setMarker(randomRestaurantMarker);
        mapsService.getOpenRestaurants()[randomIndex].infoWindow.open({ anchor: randomRestaurant.marker, map: mapsService.map });
      }
    }
  }
}

startButton?.addEventListener('click', startApp, { passive: true });

displayButton?.addEventListener(
  'click',
  () => {
    mapsService.setMarkers();
  },
  { passive: true },
);

rouletteButton?.addEventListener('click', lunchRoulette, { passive: true });

removeButton?.addEventListener('click', () => mapsService.removeMarkers(), { passive: true });
