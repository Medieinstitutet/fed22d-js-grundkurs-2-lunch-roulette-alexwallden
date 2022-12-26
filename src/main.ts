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
import gsap, { random } from 'gsap';
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
const app: HTMLDivElement | null = document.querySelector('#app');
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
const retrieveRestaurantsBtn: HTMLButtonElement | null = document.querySelector('#retrieve-btn');
const listHeading: HTMLHeadingElement | null = document.querySelector('#list-heading');
// const form: HTMLFormElement | null = document.querySelector('#form');
const mapsService: MapsService = new MapsService(mapContainer);
const timeLine = gsap.timeline({ repeat: -1 });
const toggleShowArray: any[] = [mapContainer, startButtonContainer, controls];

let userCoordinatesSuccess: any;
let userMarker: any;
let radius = 500;
console.log('BYT RADIUS');
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
    label: 'Din position',
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

function runApp() {
  console.log(radius);
  listHeading?.classList.add('hidden');
  retrieveRestaurantsBtn?.setAttribute('disabled', '');
  mapsService.clearRestaurants();
  if (restaurantsList) {
    mapsService.removeMarkers();
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
        if (mapsService.getOpenRestaurants().length === 0 && restaurantsList) {
          const checkedRadioDistance: string | null | undefined = document.querySelector(
            'input[name="range-input"]:checked',
          )?.parentElement?.textContent;
          if (checkedRadioDistance) {
            restaurantsList.innerHTML += /* html */ `
            <li>Det finns inga restauranger inom ${checkedRadioDistance}</li>`;
          }
          rouletteButton?.setAttribute('disabled', '');
          toggleModal();
        } else {
          rouletteButton?.removeAttribute('disabled');
          mapsService.attachInfoWindows();
          listHeading?.classList.remove('hidden');
          const restaurants = mapsService.getOpenRestaurants();
          restaurants.forEach((restaurant) => {
            restaurant.calculateDistance(userMarker, userCoordinates);
            const distanceUnit: string = restaurant.distance > 10 ? 'm' : 'km';
            restaurantsList.innerHTML += /* html */ `
          <li data-id="${restaurant.id}">${restaurant.info.name} Avstånd: ${restaurant.distance}${distanceUnit}</li>`;
        });
        mapsService.setMarkers();
        toggleModal();
      } else if (!userCoordinatesSuccess) {
        spinner?.classList.toggle('hidden');
        app.innerHTML = 'Du behöver aktivera platstjänster';
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
  const openRestaurants: Restaurant[] = mapsService.getOpenRestaurants();
  const randomIndex: number = Math.floor(Math.random() * (openRestaurants.length));
  console.log(randomIndex);
  const randomRestaurant = openRestaurants[randomIndex];
  randomRestaurantMarker = randomRestaurant.marker;
  mapsService.removeMarkers();
  let previousListItem: HTMLLIElement | null = null;
  console.log(openRestaurants);
  console.log(listItems);

  if (listItems) {
    let counter = 0;
    let waitTime = 50;
    for (let i = 0; i < listItems?.length;) {
      const listItem = listItems[i];
      await wait(waitTime);
      if (previousListItem) {
        previousListItem.style.color = 'rgb(177 177 177)';
      }
      listItem.style.color = 'rgb(198 0 4)';
      previousListItem = listItem;
      waitTime += 7;
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
          openRestaurants[randomIndex].infoWindow.open({ anchor: randomRestaurant.marker, map: mapsService.map });
        }
      }
    }
  }
  rouletteButton?.removeAttribute('disabled');
  await wait(1000);
  window.scrollTo(0, 0);
}

startButton?.addEventListener('click', runApp, { passive: true });

displayButton?.addEventListener(
  'click',
  () => {
    mapsService.setMarkers();
  },
  { passive: true },
);

rouletteButton?.addEventListener('click', lunchRoulette, { passive: true });

removeButton?.addEventListener('click', () => mapsService.removeMarkers(), { passive: true });

retrieveRestaurantsBtn?.addEventListener('click', runApp);

// window.initMap = mapsService.initMap;
