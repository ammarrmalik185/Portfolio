import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

try{
    firebase.initializeApp(require("../staticData.json").firebaseConfig);
}catch (e) {
    //console.error(e)
}

// Initialize Cloud Firestore and get a reference to the service
const auth = firebase.auth();
const firestore = firebase.firestore();

module.exports = { auth, firestore }

