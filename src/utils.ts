export default function shuffle(array: string[] | number[] | object[]) {
  return array.sort(() => 0.5 - Math.random());
}
