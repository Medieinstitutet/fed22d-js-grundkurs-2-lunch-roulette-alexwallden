// import Coordinates from '../models/Coordinates';

// const getUserCoordinates = (): Promise<Coordinates | null> => new Promise((resolve, reject) => {
//   navigator.geolocation.getCurrentPosition(
//     (position) => resolve(new Coordinates(position.coords.latitude, position.coords.longitude)),
//     (error) => {
//       if (error.code === 1) {
//         resolve(null);
//         return;
//       }
//       reject(console.error(error.message));
//     },
//   );
// });

// export default getUserCoordinates;

export default {};
