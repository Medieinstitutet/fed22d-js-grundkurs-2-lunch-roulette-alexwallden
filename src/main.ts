import './style/style.scss';
import userCoordinates from './inventory/userCoordinates';

const app: HTMLDivElement | null = document.querySelector('#app');

if (app !== null) { app.innerHTML = `Din position är ${userCoordinates.lat} och ${userCoordinates.lng}`; }
