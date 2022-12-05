export default function shuffle(array: string[]) {
  return array.sort(() => 0.5 - Math.random());
}
