import { Injectable } from '@angular/core';
import {first, from, map, Observable, switchMap} from "rxjs";
import {convertSnaps} from "./data-utils";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {UsersService} from "./users.service";
import {Medication} from "../models/medication";
import {Patient} from "../models/patient";

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  constructor(private db: AngularFirestore,
              private user: UsersService) { }

  createMedication(patientId: string, newMedication: Partial<Medication>): Observable<any> {
    let save$: Observable<any>;

    save$ = this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.collection(`users/${userId}/patients/${patientId}/medications`).add(newMedication))
      ),
      first()
    );

    return save$.pipe(
      map(res => {
        return {
          id: res.id,
          ...newMedication
        };
      })
    );
  }

  getMedicationsByPatient(patientId: string): Observable<Medication[]> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        this.db.collection(`users/${userId}/patients/${patientId}/medications`,
          ref => ref.orderBy('name'))
          .get()),
      first(),
      map(snaps => convertSnaps<Medication>(snaps))
    )
  }

  updateMedication(patientId: string, medicationId: string, changes: Partial<Patient>): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}/patients/${patientId}/medications/${medicationId}`).update(changes))
      ),
      first()
    );
  }

  deleteMedication(patientId: string, medicationId: string): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId => {
          console.log(userId)
          return from(this.db.doc(`users/${userId}/patients/${patientId}/medications/${medicationId}`).delete())
        }
      ),
      first()
    );
  }
}
