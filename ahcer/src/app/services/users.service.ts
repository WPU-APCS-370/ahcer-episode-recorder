import { Injectable } from '@angular/core';
import {first, from, map, Observable, switchMap} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {convertOneSnap} from "./data-utils";
import {User} from "../models/user";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;
  pictureUrl$: Observable<string>;
  userId$: Observable<string>;

  constructor(private db: AngularFirestore,
              private afAuth: AngularFireAuth,
              private router: Router) {
    this.isLoggedIn$ = afAuth.authState.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
    this.pictureUrl$ = afAuth.authState.pipe(map(user => user? user.photoURL : null));
    this.userId$ = afAuth.authState.pipe(map(user => user? user.uid: null));
  }

  getUserById(userId: string): Observable<any> {
    return this.db.doc(`users/${userId}`).valueChanges();
  }

  changeLastViewedPatient(patientId: string): Observable<any> {
    return this.userId$.pipe(
      switchMap(userId =>
    from(this.db.doc(`users/${userId}`).update({lastPatientViewed: patientId}))),
      first()
    )
  }
  getLastViewedPatient(): Observable<string> {
    return this.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}`).get())
      ),
      first(),
      map(result => convertOneSnap<User>(result).lastPatientViewed)
    )
  }

  logout() {
    this.afAuth.signOut();
    this.router.navigateByUrl('/login');
  }

}
