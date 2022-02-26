import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {from, map, Observable} from "rxjs";
import {Patient} from "../models/patient";
import {convertSnaps} from "./data-utils";

@Injectable({
  providedIn: 'root'
})
export class PatientServices {

  private userId ="7ZA7KNV0fYbo19SXYHkC";

  constructor(private db: AngularFirestore) {}


  getPatient(): Observable<Patient[]> {
    return this.db.collection(`users/${this.userId}/patients`,
      ref => ref.orderBy('lastName'))
      .get()
      .pipe(
        map(result => convertSnaps<Patient>(result))
      )
  }
  deletePatient(patientId: string): Observable<any> {
    return from(this.db.doc(`users/${this.userId}/patients/${patientId}`).delete());
  }


}
