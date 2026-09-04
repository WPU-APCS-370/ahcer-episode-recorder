// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    apiKey: "AIzaSyAkFM3cmbbWPYb2pvVcWgcuH11YmaKvjwc",
    authDomain: "ahcer-dev.firebaseapp.com",
    projectId: "ahcer-dev",
    storageBucket: "ahcer-dev.firebasestorage.app",
    messagingSenderId: "138546957712",
    appId: "1:138546957712:web:52089315887996ff9ff715",
  },
  production: false,
  deleteAccountUrl: 'http://127.0.0.1:5001/ahcer-dev/us-central1/deleteAccount'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
