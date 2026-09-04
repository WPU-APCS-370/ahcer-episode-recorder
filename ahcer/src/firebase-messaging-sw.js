importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging-compat.js");


firebase.initializeApp({
    projectId: 'wpu-ahcer',
    appId: '1:503871560040:web:b9d5945d8ece53d2241edd',
    storageBucket: 'wpu-ahcer.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyAnC2nU3mtFKZd12PFk1TQkXRsR4aA0JL8',
    authDomain: 'wpu-ahcer.firebaseapp.com',
    messagingSenderId: '503871560040',
});


const messaging = firebase.messaging();

