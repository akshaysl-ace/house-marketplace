import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";


// app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVLs0FKUvHRqFZNPmrxhi8Y5sbEmmqLYA",
    authDomain: "house-marketplace-40ece.firebaseapp.com",
    projectId: "house-marketplace-40ece",
    storageBucket: "house-marketplace-40ece.appspot.com",
    messagingSenderId: "799488119865",
    appId: "1:799488119865:web:2e3357b84c40318f5c29e8"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();