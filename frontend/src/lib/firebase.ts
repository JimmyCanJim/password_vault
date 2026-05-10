import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2SOjwyJ5Ivn7It4qaWYwExkTzbvK3tDU",
  authDomain: "password-vault-b77f4.firebaseapp.com",
  projectId: "password-vault-b77f4",
  storageBucket: "password-vault-b77f4.firebasestorage.app",
  messagingSenderId: "799744142385",
  appId: "1:799744142385:web:8048aaba6f763e44a4f910",
  measurementId: "G-GMH93GLWTX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);