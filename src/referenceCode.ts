import './style/style.scss';

// All kod härifrån och ner är bara ett exempel för att komma igång

// I denna utils-fil har vi lagrat funktioner som ofta används, t.ex. en "blanda array"-funktion
import shuffle from './utils';

// I denna fil har vi lagrat vår "data", i detta exempel en ofullständig kortlek
import exampleCardDeck from './exampleArray';

// Blanda kortleken
const myShuffledCardDeck: string[] | null = shuffle(exampleCardDeck);

/**
 * Vänder upp/ner på det klickade kortet genom att toggla en CSS-klass.
 * @param this - Det HTML-element som har klickats på
 * @return {void}
 */
function flipCard(this: HTMLElement): void {
  if (this !== undefined) {
    this.classList.toggle('visible');
  }
}

// Printa kortleken
let cardString = '';
myShuffledCardDeck.forEach((card) => {
  if (card !== null) {
    cardString += `
    <button class="card">
    <span class="front">♠</span>
    <span class="back">${card}</span>
    </button>`;
  }
});

console.log(myShuffledCardDeck);

const app: HTMLDivElement | null = document.querySelector('#app');

if (app !== null) { app.innerHTML = cardString; }

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', flipCard);
});

// const getUserPosition = (): Promise<Coordinates> => (
//   new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         resolve(new Coordinates(position.coords.latitude, position.coords.longitude));
//       },
//       (error) => {
//         if (app !== null) { app.innerHTML = 'Du har plats avstängt!'; }
//         reject(error.message);
//       },
//     );
//   })
// );

// let userPosition: Coordinates;

// const setUserPosition = async () => {
//   try {
//     userPosition = await getUserPosition();
//     console.log(userPosition);
//     app!.innerHTML += `Din position är ${userPosition.lat} och ${userPosition.lng}`;
//   } catch (err) {
//     console.log(err);
//   }
// };

// setUserPosition();

// let thenUserPosition;
// getUserPosition()
//   .then((pos) => {
//     thenUserPosition = pos;
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// console.log(thenUserPosition);
