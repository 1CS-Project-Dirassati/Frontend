// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Replace these values with your Firebase project configuration.
const firebaseConfig = {
    apiKey: "AIzaSyBIgfJBen0GlPZNlhpMYcVj-GzbV7F5aKw",
    authDomain: "expense-tracker-fdf08.firebaseapp.com",
    projectId: "expense-tracker-fdf08",
    storageBucket: "expense-tracker-fdf08.appspot.com",
    messagingSenderId: "1030403626947",
    appId: "1:1030403626947:web:c9594b94b4b53da6f48f76",
    measurementId: "G-J0JBV3XWVW"
  };
  

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Storage and export it if needed
const storage = getStorage(firebaseApp);

export { firebaseApp, storage };








