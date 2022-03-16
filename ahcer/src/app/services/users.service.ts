import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;
  pictureUrl$: Observable<string>;
  userId$: Observable<string>;

  constructor(private db: AngularFirestore,
              private afAuth: AngularFireAuth) {
    this.isLoggedIn$ = afAuth.authState.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
    this.pictureUrl$ = afAuth.authState.pipe(map(user => user? user.photoURL : null));
    this.userId$ = afAuth.authState.pipe(map(user => user? user.uid: null));
  }

  getUserById(userId: string): Observable<any> {
    return this.db.doc(`users/${userId}`).valueChanges();
  }

}
