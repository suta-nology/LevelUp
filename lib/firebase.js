import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyAEJN94pHp1UB-g5GC2sS6Q8_et4uJWG7o",
  authDomain:        "levelup-web-807c7.firebaseapp.com",
  projectId:         "levelup-web-807c7",
  storageBucket:     "levelup-web-807c7.firebasestorage.app",
  messagingSenderId: "820790724236",
  appId:             "1:820790724236:web:f4a19bbc9d4a81de96dda9",
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
