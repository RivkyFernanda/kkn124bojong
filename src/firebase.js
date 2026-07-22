import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBQFB-dLDEU7xqDA68v4pHBgtMZEaIVcr0",
  authDomain: "kkn124bojong.firebaseapp.com",
  projectId: "kkn124bojong",
  storageBucket: "kkn124bojong.firebasestorage.app",
  messagingSenderId: "734565254358",
  appId: "1:734565254358:web:c2c6485d4a4dacae7a3577",
  databaseURL: "https://kkn124bojong-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
