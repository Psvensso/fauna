export function uid(len: number) {
  len = len || 12;
  return Math.random().toString(35).substr(2, len);
}
