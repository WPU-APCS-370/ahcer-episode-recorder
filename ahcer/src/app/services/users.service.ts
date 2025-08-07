import { Injectable } from '@angular/core';
import { first, from, map, Observable, of, switchMap } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { convertOneSnap } from "./data-utils";
import { User } from "../models/user";
import { Router } from "@angular/router";
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';

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
  study$: Observable<any>;
  ThisUserId$: Observable<any>;


  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.isLoggedIn$ = afAuth.authState.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
    this.pictureUrl$ = afAuth.authState.pipe(map(user => user ? user.photoURL : null));
    this.newUserId$ = afAuth.authState.pipe(map(user => user ? user.uid : null));
    this.userId$ = this.getCurerntUser().pipe(map((user: any) => {
      return user ? user['parentId'] ? user['parentId'] : user.id : null
    }));
    this.study$ = this.getCurerntUser().pipe(map((user: any) => {
      return user ? user['study'] ? user['study'] : user.study : null
    }));
    this.ThisUserId$ = this.getCurerntUser().pipe(map((user: any) => {
      return user ?  user.id : null
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

  changeLastViewedPatient(patientId: any, UserId?: any): Observable<any> {
    return this.userId$.pipe(
      switchMap((userId:any)=> {
        if(UserId){
          return from(this.db.doc(`users/${userId}`).update({ lastPatientViewed: patientId,lastPatientViewdUserId: UserId }))
        }
        else{
          return from(this.db.doc(`users/${userId}`).update({ lastPatientViewed: patientId }))
        }
      }),
      first()
    );

  }

  getLastViewedPatient(UserId?: string): Observable<any> {
    return this.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${UserId ? UserId : userId}`).get())
      ),
      first(),
      map(result =>convertOneSnap<User>(result))
    )
  }


  deleteAccount(uid: string) {
    const url = environment.deleteAccountUrl;
    return this.http.post(url, { uid }).toPromise();
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


  updateUserVideoArray(videos: any[],UserId?:string): Observable<any> {
    return this.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${UserId ? UserId : userId}`).update({ videos }))
      ),
      first()
    )
  }

  logout() {
    this.afAuth.signOut();
    this.router.navigateByUrl('/login');
    localStorage.removeItem('user')
  }

 async createUserByEmailPassword(email: string, password: string): Promise<any> {
    const firebaseApp = initializeApp(environment.firebase, 'authApp');
    const detachedAuth = getAuth(firebaseApp);
    let user = await createUserWithEmailAndPassword(detachedAuth, email, password);
    return user;
  }

  passwordRest(email: string): Promise<void> {
    const firebaseApp = initializeApp(environment.firebase, 'authApp');
    const detachedAuth = getAuth(firebaseApp);
    return sendPasswordResetEmail(detachedAuth, email)
  }




  deleteUserDoc(uid: string) {
    return this.db.doc(`users/${uid}`).delete();
  }

  getUserChilds(parent_id: string) {
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
  getAllUser(piUser?:string) {
    return this.study$.pipe(
      switchMap(studyId => {
        const studyToUse = piUser || studyId;
        if (!studyToUse) {
          return  this.getAllUsers()
        }
        return this.db.collection('users', ref =>
          ref.where('study', '==', studyToUse)
        ).snapshotChanges().pipe(
          map(actions =>
            actions.map(a => {
              const data = a.payload.doc.data() as any;
              const id = a.payload.doc.id;
              return { id, ...data };
            })
          )
        );
      })
    );
  }

  getAllUsers() {
    return this.db.collection('users')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }





  loginWithEmail(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
  }

  get isAdmin() {
    if (localStorage.getItem('user')) {
      const data = JSON.parse(localStorage.getItem('user'));
      return data ? data.isAdmin : false;
    }
    else {
      return false;
    }
  }

  get piUser(){
    if (localStorage.getItem('user')) {
      const data = JSON.parse(localStorage.getItem('user'));
      return data ? data.PI : false;
    }
    else {
      return false;
    }
  }

  onLoginSuccessful(username?:string) {
    this.afAuth.app.then(cred => {
      let uid = cred.auth().currentUser.uid;
      this.db.firestore.doc(`users/${uid}`)
        .get()
        .then((doc) => {
          const data = doc.data();
          if (!doc.exists) {
            let obj = {
              email: cred.auth().currentUser.email,
              isParent: true,
              study:'',
              password: '',
              username: username ? username : cred.auth().currentUser.displayName || ''
            };
            this.db.collection(`users`).doc(uid).set(obj);
            localStorage.setItem('user', JSON.stringify(obj))
          }
          else {
            localStorage.setItem('user', JSON.stringify(data))
          }
          this.router.navigateByUrl('/')
        });
    });
  }
  updateUser(username: any,userId:string): Promise<void> {
    return this.db.doc(`users/${userId}`).update(username);
  }

}
