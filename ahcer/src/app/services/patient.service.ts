import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {from, map, Observable, switchMap} from "rxjs";
import {Patient} from "../models/patient";
import {convertSnaps} from "./data-utils";
import {UsersService} from "./users.service";

@Injectable({
  providedIn: 'root'
})

export class PatientServices {

  constructor(private db: AngularFirestore,
              private user: UsersService) {  }

  createPatient(newPatient: Partial<Patient>): Observable<any> {
    let save$: Observable<any>;

    save$ = this.user.userId$.pipe(
      switchMap(userId =>
          from(this.db.collection(`users/${userId}/patients/`).add(newPatient))
      )
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

  getPatient(userId?: string): Observable<Patient[]> {
    if(!userId) {
      return this.user.userId$.pipe(
        switchMap(resUserId => this.db.collection(`users/${resUserId}/patients`,
          ref => ref.orderBy('lastName')).get()),
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
  updatePatient(patientId: string, changes: Partial<Patient>): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}/patients/${patientId}`).update(changes))
      )
    );
  }

  deletePatient(patientId: string): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}/patients/${patientId}`).delete())
      )
    );
  }


}
