import Coordinates from '../models/Coordinates';

const app = document.querySelector('#app');

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

// eslint-disable-next-line import/no-mutable-exports
const userCoordinates: Coordinates = await getUserCoordinates() as Coordinates;

export default userCoordinates;
