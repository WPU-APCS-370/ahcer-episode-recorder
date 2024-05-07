import { Injectable } from '@angular/core';
import { first, from, map, Observable, switchMap } from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {convertOneSnap } from "./data-utils";
import {User} from "../models/user";
import {Router} from "@angular/router";
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  currentUser$: Observable<any>;
  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;
  pictureUrl$: Observable<string>;
  newUserId$: Observable<string>;
  userId$: Observable<any>;

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.isLoggedIn$ = afAuth.authState.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
    this.pictureUrl$ = afAuth.authState.pipe(map(user => user? user.photoURL : null));
    this.newUserId$ = afAuth.authState.pipe(map(user => user? user['parentId'] ? user['parentId'] : user.uid: null));
    this.userId$ = this.getCurerntUser().pipe(map((user:any)=>{
      return user ?user['parentId'] ?user['parentId'] :user.id : null
    }));
  }

  getCurerntUser(): Observable<any> {
    this.currentUser$ = this.newUserId$.pipe(
      switchMap(userId =>
        this.db.doc<any>(`users/${userId}`).get().pipe(
          map(docSnapshot => {
            if (docSnapshot.exists) {
              const data = docSnapshot.data();
              const id = docSnapshot.id;
              return { id, ...data };
            } else {
              return null;
            }
          })
        )
      ),
      first()
    )
    return this.currentUser$;
  }

  getUserById(userId: string): Observable<any> {
    return this.db.doc(`users/${userId}`).valueChanges();
  }

  changeLastViewedPatient(patientId: string): Observable<any> {
    return this.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}`).update({lastPatientViewed: patientId}))
      ),
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

  getUserVideos(): Observable<any> {
    return this.userId$.pipe(
      switchMap(resUserId => 
        this.db.doc(`users/${resUserId}`).get().pipe(
          map(snapshot => snapshot.data())
        )
      ),
      first()
    );
  
  }

  updateUserVideoArray(videos: any[]): Observable<any> {
    return this.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}`).update({videos}))
      ),
      first()
    )
  }

  logout() {
    this.afAuth.signOut();
    this.router.navigateByUrl('/login');
  }

  createUserByEmailPassword(email:string,password:string):Promise<any>{
    const firebaseApp = initializeApp(environment.firebase, 'authApp');
    const detachedAuth = getAuth(firebaseApp);
    return createUserWithEmailAndPassword(detachedAuth, email, password)
  }

  getUserChilds(parent_id: string){
    return this.db.collection('users', ref => 
      ref.where('parentId', '==', parent_id)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data: {} = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  loginWithEmail(email:string, password:string){
    return this.afAuth.signInWithEmailAndPassword(email, password)
  }

}