import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDL95QhTKjW28d05Bt9NPgeDmrM5xJMamo",
  authDomain: "beautyrating-62835.firebaseapp.com",
  projectId: "beautyrating-62835",
  storageBucket: "beautyrating-62835.firebasestorage.app",
  messagingSenderId: "580221258049",
  appId: "1:580221258049:web:8ef99212ae2bdb3a98f9c0",
  measurementId: "G-LY7PE49L02"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
