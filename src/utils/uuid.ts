// import { v4 as uuidv4 } from "uuid";

// export function createUUID() {
//   return uuidv4();
// }
export function createUUID() {
  return crypto.randomUUID();
}
