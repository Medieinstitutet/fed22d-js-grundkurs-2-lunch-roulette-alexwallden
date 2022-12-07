/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
// import userCoordinates from './inventory/userCoordinates';
import Coordinates from './models/Coordinates';

declare global {
  interface Window {
    initMap: () => void;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');

let userCoordinates: Coordinates | null = null;

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

const run = async () => {
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
  userCoordinates = await getUserCoordinates() as Coordinates;

  if (app !== null) {
    app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`;
  }
  window.initMap = initMap;
  initMap();
};
// function userCoordinates() {
//   getUserCoordinates()
//     .then((coords) => coords as Coordinates)
//     .catch((err) => {
//       console.error(err);
//     });
// }

run()
  .then((x) => {
    console.log(x);
  })
  .catch((err) => {
    console.error(err);
  });
