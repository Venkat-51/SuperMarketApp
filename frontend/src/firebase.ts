// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAf8mX56O46Ln6W3kTYBQF8jF7AEiZed4A",
  authDomain: "supermarketapp-8b0b7.firebaseapp.com",
  projectId: "supermarketapp-8b0b7",
  storageBucket: "supermarketapp-8b0b7.firebasestorage.app",
  messagingSenderId: "77764386322",
  appId: "1:77764386322:web:f7b25a7566d2a89dad02cb",
  measurementId: "G-SVSVL9M6LZ"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
auth.useDeviceLanguage();
const analytics = getAnalytics(app);

export { auth };