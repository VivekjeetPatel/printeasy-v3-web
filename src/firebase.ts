import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuKQAS4uhhYU_03RxGbVnJccLFVQgalhA",
  authDomain: "printeasy-10d60.firebaseapp.com",
  projectId: "printeasy-10d60",
  storageBucket: "printeasy-10d60.firebasestorage.app",
  messagingSenderId: "222262678370",
  appId: "1:222262678370:web:e921e11226a02929ba123b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app); 