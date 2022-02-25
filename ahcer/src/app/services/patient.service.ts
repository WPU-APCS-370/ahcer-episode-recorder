import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore/";
import {Patient} from "../models/patient";
import {from, map, Observable} from "rxjs";
import {convertSnaps} from "./data-utils";

@Injectable({
  providedIn: 'root'
})

export class PatientServices {

  private userId ="7ZA7KNV0fYbo19SXYHkC";

  constructor(private db: AngularFirestore) { }

  createPatient(newPatient: Partial<Patient>): Observable<any> {
    let save$: Observable<any>;

    save$ = from(this.db.collection(`users/${this.userId}/patients/`).add(newPatient));

    return save$.pipe(
      map(res => {
        return {
          id: res.id,
          ...newPatient
        };
      })
    );
  }

  getPatient(): Observable<Patient[]> {
    return this.db.collection(`users/${this.userId}/patients`,
      ref => ref.orderBy('lastName'))
      .get()
      .pipe(
        map(result => convertSnaps<Patient>(result))
      )
  }
  updatePatient(patientId: string, changes: Partial<Patient>): Observable<any> {
    return from(this.db.doc(`users/${this.userId}/patients/${patientId}`).update(changes));
  }
}
