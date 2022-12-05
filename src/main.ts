import './style/style.scss';
import Coordinates from './models/Coordinates';

const coords = new Coordinates(1, 1);
console.log(coords);

const app: HTMLDivElement | null = document.querySelector('#app');

// Check if location tracking is allowed

// Prompt user to allow if now allowed

// Save users location in variable

const getUserPosition = (): Promise<Coordinates> => (
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(new Coordinates(position.coords.latitude, position.coords.longitude));
      },
      (error) => {
        if (app !== null) app.innerHTML = 'Du har plats avstängt!';
        reject(error.message);
      };
    )
  })
)

let userPosition: Coordinates;

const setUserPosition = async () => {
  try {
    userPosition = await getUserPosition();
    console.log(userPosition);
    app!.innerHTML += `Din position är ${userPosition.lat} och ${userPosition.lng}`;
  }
  catch (err) {
    console.log(err);
  }
};

setUserPosition();

let thenUserPosition;
const position = getUserPosition()
  .then((pos) => {
    thenUserPosition = pos;
  })
  .catch((err) => {
    console.log(err);
  });

console.log(thenUserPosition);

// const userPosition: {
//   lat: number, lon: number
// } = {
//   lat: 0,
//   lon: 0,
// };

// const getLocation = (positionToSet) => {
//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       console.log('Hämtat!');
//       Object.keys(userPosition).forEach((prop) => {
//         if (prop === 'lon') {
//           position.lon = 1;
//         }
//       });
//       positionToSet.lat = position.coords.latitude;
//       positionToSet.lon = position.coords.longitude;
//     },
//     ((error) => {
//       if (error.code === 1) {
//         console.log(error.message);
//         app!.innerHTML = `<h1>Du behöver aktivera platstjänster i din webbläsare.
//      <a href="https://support.google.com/chrome/answer/142065?hl=en&co=GENIE.Platform%3DDesktop">
//      Gå till denna länk för att se hur du gör</a></h1>`;
//       } else if (error.code === 0) {
//         console.log(error.message);
//       }
//     }),
//   );
// };

// getLocation(userPosition);
// console.log(getLocation(userPosition));

// setTimeout(() => {
//   console.log(userPosition);
// }, 10000);

// console.log(navigator.geolocation);

// console.log(navigator.geolocation ? 'Ja' : 'Nej');

// const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
// console.log(permissionStatus);
// console.log(permissionStatus.state);
// const hasPermission = permissionStatus?.state; // Dynamic value

// console.log(hasPermission);

// navigator.geolocation.getCurrentPosition(
//   (position) => {
//     console.log(position.coords.latitude);
//   },
//   (error) => {
//     if (error.code === 1) {
//       console.log('you denied me :-(');
//       console.log(error);
//       navigator.permissions.query({ name: 'geolocation' })
//       .then(console.log)
//     }
//   },
// );
