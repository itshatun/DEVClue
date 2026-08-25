// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAB22zDSuD_sbyupfzmTG94pGBOArcoPls",
  authDomain: "devclue.firebaseapp.com",
  projectId: "devclue",
  storageBucket: "devclue.firebasestorage.app",
  messagingSenderId: "174994927059",
  appId: "1:174994927059:web:15a547d17dbc5351245326",
  measurementId: "G-STWJH62EZ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);