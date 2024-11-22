import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, first, forkJoin, from, map, Observable, switchMap } from "rxjs";
import { Patient } from "../models/patient";
import { convertOneSnap, convertSnaps } from "./data-utils";
import { UsersService } from "./users.service";
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Injectable({
  providedIn: 'root'
})

export class PatientServices {
  constructor(private db: AngularFirestore,
    private angularFireMessaging: AngularFireMessaging,
    private user: UsersService) { }

    getFCMToken(): Observable<string> {
      return new Observable((observer) => {
        this.angularFireMessaging.requestToken.subscribe(
          (token) => {
            if (token == null) {
              localStorage.removeItem('fcmToken');
              console.log('FCM token removed');
            } else {
              console.log('FCM token received: ', token);
            }
            observer.next(token);
            observer.complete();
          },
          (error) => {
            console.error('Unable to get FCM token.', error);
            observer.error(error);
          }
        );
      });
    }

  createPatient(newPatient: Partial<Patient>): Observable<any> {
    let save$: Observable<any>;

    save$ = this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.collection(`users/${userId}/patients/`).add(newPatient))
      ),
      first()
    );

    return save$.pipe(
      map(res => {
        return {
          id: res.id,
          ...newPatient
        };
      })
    );
  }



  getPatients(userId?: string): Observable<Patient[]> {
    if (!userId) {
      return this.user.userId$.pipe(
        switchMap(resUserId => this.db.collection(`users/${resUserId}/patients`,
          ref => ref.orderBy('lastName')).get()),
        first(),
        map(result => convertSnaps<Patient>(result))
      )
    }
    else {
      return this.db.collection(`users/${userId}/patients`,
        ref => ref.orderBy('lastName'))
        .get()
        .pipe(
          map(result => convertSnaps<Patient>(result))
        )
    }
  }

  getAllRecords(): Observable<any[]> {
    return this.db.collection('users', ref =>
    ref.where('isRead', '==', true)).get()
      .pipe(
        switchMap((querySnapshot: any) => {
          const observables = querySnapshot.docs.map(doc => {
            const userId = doc.id;
            return this.db.collection(`users/${userId}/patients`).get()
              .pipe(
                map((patientsSnapshot: any) => {
                  return patientsSnapshot.docs.map(patientDoc => {
                    return {
                      id: patientDoc.id,
                      userId: userId,
                      ...patientDoc.data()
                    };
                  });
                })
              )
          });
          return forkJoin(observables);
        }),
        map((results: any[]) => {
          return results.reduce((acc, arr) => acc.concat(arr), []);
        })
      );
  }

  updatePatient(patientId: string, changes: Partial<Patient>,UserId?:string): Observable<any> {
    console.log(UserId);

    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${UserId ? UserId : userId}/patients/${patientId}`).update(changes))
      ),
      first()
    );
  }

  deletePatient(patientId: string,UserId?:string): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${UserId ? UserId : userId}/patients/${patientId}`).delete())
      ),
      first()
    );
  }

  getPatientById(patientId: string, UserId?: string): Observable<Patient> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.collection(`users/${UserId ? UserId : userId}/patients`).doc(patientId)
          .get())),
      first(),
      map(result => convertOneSnap<Patient>(result))
    )
  }

}
