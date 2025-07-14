import { compare, hash } from "bcrypt";

export async function hashValue(password: string, saltRound?: number) {
  return await hash(password, saltRound || 10);
}

export async function compareValue(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword).catch((error) => {
    console.log("error while comparing passwords:", error);
    return false;
  }); // return false if comparison fails
}
