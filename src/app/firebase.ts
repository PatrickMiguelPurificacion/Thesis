import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,  } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzuBQ3iFhUPc9Af2h5KQEjQhQSP44ccgI",
  authDomain: "secuspire.firebaseapp.com",
  projectId: "secuspire",
  storageBucket: "secuspire.appspot.com",
  messagingSenderId: "716677770608",
  appId: "1:716677770608:web:0080f98e12bb5c048673b5",
  measurementId: "G-JMM71Z6B54"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

export { app, db, auth }