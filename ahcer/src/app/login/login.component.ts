import { Component, OnInit } from '@angular/core';
import * as firebaseui from "firebaseui";
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from "firebase/compat/app";
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  ui: firebaseui.auth.AuthUI;
  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private db: AngularFirestore) { }

  ngOnInit(): void {
    this.afAuth.app.then(app => {
      const uiConfig = {
        signInOptions: [

          EmailAuthProvider.PROVIDER_ID,
          GoogleAuthProvider.PROVIDER_ID,

        ],
        callbacks: {
          signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
        }
      };
      this.ui = new firebaseui.auth.AuthUI(app.auth());
      this.ui.start('#firebaseui-auth-container', uiConfig);
    })
  }

  ngOnDestroy() {
    this.ui.delete();
  }

  onLoginSuccessful() {
    this.afAuth.app.then(cred => {
      let uid = cred.auth().currentUser.uid;
      this.db.firestore.doc(`users/${uid}`)
        .get()
        .then((doc)=> {
          return !doc.exists ?
            this.db.collection(`users`).doc(uid).set({}) :
            null;
        });
    });
    this.router.navigateByUrl('/')
  }
}
