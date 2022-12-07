import './style/style.scss';
import userCoordinates from './inventory/userCoordinates';

const app: HTMLDivElement | null = document.querySelector('#app');

if (app !== null) { app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`; }

// Initialize and add the map
function initMap(): void {
  // The map, centered at Uluru
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 16,
      center: userCoordinates,
    }
  );

  // The marker, positioned at Uluru
  const marker = new google.maps.Marker({
    position: userCoordinates,
    map: map,
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

initMap();
