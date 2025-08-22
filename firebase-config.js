// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNb-O3r1UgPP4OdFfpoGZzaXeAAYm0vnk",
  authDomain: "testin01-327fd.firebaseapp.com",
  projectId: "testin01-327fd",
  storageBucket: "testin01-327fd.firebasestorage.app",
  messagingSenderId: "1077308822547",
  appId: "1:1077308822547:web:7ab494e5a45c798285dbe6",
  measurementId: "G-P4TY1H0JC1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };