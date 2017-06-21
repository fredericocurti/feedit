import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyBcFce_uWpOt8QHJKnU7fBBaPmOSMEbiTo",
    authDomain: "febee-2b942.firebaseapp.com",
    databaseURL: "https://febee-2b942.firebaseio.com",
    projectId: "febee-2b942",
    storageBucket: "febee-2b942.appspot.com",
    messagingSenderId: "301542026521"
};

firebase.initializeApp(config)

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth