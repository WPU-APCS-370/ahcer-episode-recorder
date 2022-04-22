import { Injectable } from '@angular/core';
import {endWith, first, from, map, Observable, switchMap, takeWhile} from "rxjs";
import {convertSnaps} from "./data-utils";
import {AngularFirestore, QueryFn} from "@angular/fire/compat/firestore";
import {UsersService} from "./users.service";
import {Medication} from "../models/medication";
import {Patient} from "../models/patient";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;

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
          ref => ref.where('archive', '==', false)
          .orderBy('name'))
          .get()),
      first(),
      map(snaps => convertSnaps<Medication>(snaps))
    )
  }

  getMedicationsByType(patientId: string, isRescue: boolean,
                       onlyActiveMeds: boolean = false): Observable<Medication[]> {
    if(isRescue && onlyActiveMeds) {
      throw new Error("onlyActiveMeds can only be true when isRescue is false.")
    }
    let dbQueryFn : QueryFn<firebase.firestore.DocumentData> = ref => {
      if (onlyActiveMeds)
        return ref.where("archive", "==", false)
          .where("type", "!=", "Rescue")
          .where("active", "==", true)
      else
        return ref.where("archive", "==", false)
          .where("type", (isRescue)? "==": "!=", "Rescue")
    }
    return this.user.userId$.pipe(
      switchMap(userId =>
      this.db.collection(`users/${userId}/patients/${patientId}/medications`,
          dbQueryFn)
        .get()),
      first(),
      map(snaps => convertSnaps<Medication>(snaps)),
      map(medications => medications.sort((a, b) => ((a.name < b.name)? -1 : 1)))
    )
  }

  getMedicationsByIds(patientId: string, medicationsIdArray: string[]): Observable<Medication[]> {
    let idChunks : string[][] = []
    for(let i=0; i<medicationsIdArray.length; i+=10) {
      idChunks.push(medicationsIdArray.slice(i, i+10));
    }
    return this.user.userId$.pipe(
      switchMap(userId => from(idChunks).pipe(
        map(medIds=> [userId, medIds]),
        endWith(null)
      )),
      takeWhile((x) => x != null),
      switchMap(([userId, medIds]) =>
        this.db.collection(`users/${userId}/patients/${patientId}/medications`,
          ref => ref.where(firebase.firestore.FieldPath.documentId(), "in", medIds))
            //in clause supports only up to 10 elements in the array.
          .get()),
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

  archiveMedication(patientId: string, medicationId: string): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId => {
          return from(this.db.collection(`users/${userId}/patients/${patientId}/medications`)
            .doc(medicationId)
            .update({
              archive: true,
              archiveDate: Timestamp.fromDate(new Date())
            }))
        }
      ),
      first()
    );
  }
}
