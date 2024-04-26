import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private db: AngularFirestore) { }

  ngOnInit(): void {

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
