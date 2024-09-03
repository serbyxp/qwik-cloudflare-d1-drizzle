import type { AppDatabase } from "~/database";
import { getDB } from "~/database";
import crypto from "crypto";

export async function generateRandomToken(length: number) {
  const buf = await new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(Math.ceil(length / 2), (err, buf) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });

  return buf.toString("hex").slice(0, length);
}

export async function createTransaction<T extends AppDatabase>(
  cb: (trx: T) => void
) {
  await getDB().transaction(cb as any);
}
