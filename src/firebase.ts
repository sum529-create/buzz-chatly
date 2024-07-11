import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwDcukGCWJluG7w5HTO1bUTzpeQY_54lc",
  authDomain: "buzz-chatly.firebaseapp.com",
  projectId: "buzz-chatly",
  storageBucket: "buzz-chatly.appspot.com",
  messagingSenderId: "651561943942",
  appId: "1:651561943942:web:4ea9ade2072b85df08e207",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
