## Features:
- Kartan ska ladda med center på Sverige utan nål innan användaren startat appen
- Slumpa en restaurang
  - Displaya restaurangen på kartan
  - Displaya restaurangen i text
- Välja restauranger utifrån en radie
  - Displaya restaurangerna på kartan
  - Displaya restaurangerna i text


## Att göra:
- [x] En knapp som användaren får trycka på för att starta appen
- [x] Kolla om platser är tillåtet av användaren
- [x] Spara koordinaterna i en variabel
- [ ] Förstå och implementera ikoner: http://map-icons.com/
- [ ] Fixa lint overrides
- [ ] Ändra default-koordinaterna i initMap.
- [ ] Flytta creatUsermarker till mapsService och skapa en inforuta till den.
- [ ] Kolla om man kan göra openRestaurants till ett Set

## Frågor:
- Hur sätter jag funktioner som listeners på markers utan att det blir en unik funktion som det blir nu i och marker.addListener? mapsService.ts 118
- Skippa then i startApp och bara göra den funktionen till async?
- Vad göra med alla ESLint-overrides?
- If från 97 i mapsService


Min filtrering sker för snabbt
Promise.allsettled