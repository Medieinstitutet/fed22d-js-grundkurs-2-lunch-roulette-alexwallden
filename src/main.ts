/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import './style/style.scss';
import userCoordinates from './inventory/userCoordinates';

declare const google: any;
const app: HTMLDivElement | null = document.querySelector('#app');

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
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

initMap();
