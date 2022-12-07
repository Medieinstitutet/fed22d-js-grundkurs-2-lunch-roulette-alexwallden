/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
// import userCoordinates from './inventory/userCoordinates';
import Coordinates from './models/Coordinates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');

const getUserCoordinates = () => new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(
    (position) => resolve(new Coordinates(position.coords.latitude, position.coords.longitude)),
    (error) => {
      if (error.code === 1 && app !== null) {
        app.innerHTML = 'Du behöver aktivera platstjänster';
      }
      reject(console.error(error.message));
    },
  );
});

const userCoordinates: Coordinates = await getUserCoordinates() as Coordinates;

// function userCoordinates() {
//   getUserCoordinates()
//     .then((coords) => coords as Coordinates)
//     .catch((err) => {
//       console.error(err);
//     });
// }

if (app !== null) {
  app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
}

// Initialize and add the map
function initMap(): void {
  const map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 16,
      center: userCoordinates,
    },
  );

  const marker = new google.maps.Marker({
    position: userCoordinates,
    map,
  });

  console.log(marker);
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

initMap();
