import { Member } from "./Member";

export interface User extends Member {
  voted: boolean,
  admin: boolean
}