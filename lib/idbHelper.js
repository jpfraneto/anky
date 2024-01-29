// idbHelper.js
import { openDB } from "idb";

let dbPromise;

export const initializeDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB("userAppData", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("userInformation")) {
          db.createObjectStore("userInformation");
        }
      },
    });
  }
  return dbPromise;
};

export const setUserData = async (key, val) => {
  const db = await dbPromise;
  if (!db) return;
  return db.put("userInformation", val, key);
};

export const getUserData = async (key) => {
  const db = await dbPromise;
  if (!db) return;
  return db.get("userInformation", key);
};

export const deleteUserData = async (key) => {
  const db = await dbPromise;
  if (!db) return;
  return db.delete("userInformation", key);
};
