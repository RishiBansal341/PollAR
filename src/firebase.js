// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCiz5P35-5rTmdiZLBCm6FwdjIjJRMSnwM",
  authDomain: "pollar-f6848.firebaseapp.com",
  projectId: "pollar-f6848",
  storageBucket: "pollar-f6848.firebasestorage.app",
  messagingSenderId: "824009906289",
  appId: "1:824009906289:web:0bbf09dc009c2f718563d0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };

