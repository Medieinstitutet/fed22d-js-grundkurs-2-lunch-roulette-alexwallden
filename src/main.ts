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
import Restaurant from './models/Restaurant';

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
const rouletteButton: HTMLElement | null = document.querySelector('#roulette-btn');
const rangeInputs: HTMLElement[] = Array.from(document.querySelectorAll('input[name="range-input"]'));
const retrieveRestaurantsBtn: HTMLButtonElement | null = document.querySelector('#retrieve-btn');
const listHeading: HTMLHeadingElement | null = document.querySelector('#list-heading');
const mapsService: MapsService = new MapsService(mapContainer);
const timeLine = gsap.timeline({ repeat: -1 });
const toggleShowArray: any[] = [mapContainer, startButtonContainer, controls];

let userCoordinatesSuccess: boolean | null;
let userMarker: any;
let radius = 500;
let userCoordinates: Coordinates | null = null;
let randomRestaurantMarker: any;
let showModal = false;

function toggleLoadingModal() {
  showModal = !showModal;
  loadingModal?.classList.toggle('hidden');
  if (showModal) {
    timeLine.set('.spinner', { rotation: 0 });
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
    label: 'Din position',
  });
  userMarker = marker;
}

function showOrHide(elementsArray: any[]) {
  elementsArray.forEach((element: any) => {
    element.classList.toggle('hidden');
  });
}

function openInfoFromList(event: Event) {
  const { target } = event;
  const listItem = (target as HTMLHeadingElement).parentElement;
  mapsService.getOpenRestaurants().forEach((restaurant) => {
    if (Number((listItem as HTMLLIElement).dataset.id) === restaurant.id) {
      restaurant.toggleInfoWindow();
    }
  });
}

function runApp() {
  listHeading?.classList.add('hidden');
  retrieveRestaurantsBtn?.setAttribute('disabled', '');
  if (restaurantsList) {
    mapsService.removeMarkers();
    restaurantsList.innerHTML = '';
  }
  mapsService.clearRestaurants();
  console.log('Startar appen');
  (async () => {
    toggleLoadingModal();
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
        if (mapsService.getOpenRestaurants().length === 0 && restaurantsList) {
          const checkedRadioDistance: string | null | undefined = document.querySelector(
            'input[name="range-input"]:checked',
          )?.parentElement?.textContent;
          if (checkedRadioDistance) {
            restaurantsList.innerHTML += /* html */ `
            <li>Det finns inga restauranger inom ${checkedRadioDistance}</li>`;
          }
          rouletteButton?.setAttribute('disabled', '');
          toggleLoadingModal();
        } else {
          rouletteButton?.removeAttribute('disabled');
          mapsService.attachInfoWindows();
          listHeading?.classList.remove('hidden');
          const restaurants = mapsService.getOpenRestaurants();
          restaurants.forEach((restaurant) => {
            restaurant.calculateDistance(userMarker, userCoordinates);
            const distanceUnit: string = restaurant.distance > 10 ? 'm' : 'km';
            restaurantsList.innerHTML += /* html */ `
          <li class="hover" data-id="${restaurant.id}"><h3>${restaurant.info.name}</h3> <p>Avstånd: ${restaurant.distance}${distanceUnit}</p></li>`;
          });
          mapsService.setMarkers();
          const restaurantListItems: any[] = Array.from(restaurantsList.children);
          restaurantListItems.forEach((item) => {
            item.addEventListener('click', openInfoFromList, { passive: true });
          });
          toggleLoadingModal();
        }
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
    radius = Number((target as HTMLOptionElement).value);
    if (retrieveRestaurantsBtn) {
      retrieveRestaurantsBtn.removeAttribute('disabled');
    }
  }
}

rangeInputs.forEach((input) => {
  input.addEventListener('click', setRadius, { passive: true });
});

async function lunchRoulette(): Promise<any> {
  rouletteButton?.setAttribute('disabled', '');
  window.scrollTo(0, document.body.scrollHeight);
  if (randomRestaurantMarker) {
    randomRestaurantMarker.setMap(null);
  }
  const listItems: HTMLLIElement[] | null = Array.from(document.querySelectorAll('#restaurants-list li'));
  listItems.forEach((item) => {
    item.classList.toggle('hover'); // Remove color when list item is hovered
    if (item.classList.contains('highlighted')) { // Remove highlight if roulette has been run before
      item.classList.toggle('highlighted');
    }
  });
  const openRestaurants: Restaurant[] = mapsService.getOpenRestaurants();
  const randomIndex: number = Math.floor(Math.random() * (openRestaurants.length));
  const randomRestaurant = openRestaurants[randomIndex];
  randomRestaurantMarker = randomRestaurant.marker;
  mapsService.removeMarkers();
  let previousListItem: HTMLLIElement | null = null;

  if (listItems) {
    let counter = 0;
    let waitTime = 30;
    for (let i = 0; i < listItems?.length;) {
      const listItem = listItems[i];
      await wait(waitTime);
      if (previousListItem) {
        previousListItem.classList.toggle('highlighted');
      }
      listItem.classList.toggle('highlighted');
      previousListItem = listItem;
      waitTime += 10;
      if (counter < 3) {
        if (i === listItems.length - 1) {
          i = 0;
          counter += 1;
        } else {
          i += 1;
        }
      } else if (counter === 3) {
        if (i !== randomIndex) {
          i += 1;
        } else if (i === randomIndex) {
          i = listItems.length;
          mapsService.setMarker(randomRestaurantMarker);
          openRestaurants[randomIndex].toggleInfoWindow(true);
        }
      }
    }
  }
  rouletteButton?.removeAttribute('disabled');
  await wait(1000);
  listItems.forEach((item) => { // List item gets red when hovered
    item.classList.toggle('hover');
  });
  window.scrollTo(0, 0);
}

startButton?.addEventListener('click', runApp, { passive: true });

rouletteButton?.addEventListener('click', lunchRoulette, { passive: true });

retrieveRestaurantsBtn?.addEventListener('click', runApp, { passive: true });
