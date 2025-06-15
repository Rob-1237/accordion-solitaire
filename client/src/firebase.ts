// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For Firebase Authentication
import { getFirestore } from "firebase/firestore"; // For Cloud Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional (for hosting)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Only include measurementId if it exists in your .env.local (i.e., if Analytics was enabled)
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Auth service
export const auth = getAuth(app);

// Get a reference to the Firestore service
export const db = getFirestore(app);

// Optionally, you can also export the app instance if needed elsewhere
export default app;

// client/src/firebase.ts
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // <-- Add this import

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app); // <-- Add or confirm this line is exported