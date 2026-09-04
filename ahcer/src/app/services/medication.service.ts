import { Injectable } from '@angular/core';
import { endWith, first, from, map, Observable, switchMap, takeWhile } from "rxjs";
import { convertSnaps } from "./data-utils";
import { AngularFirestore, QueryFn, Query } from "@angular/fire/compat/firestore";
import { UsersService } from "./users.service";
import { Medication } from "../models/medication";
import { Patient } from "../models/patient";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  constructor(private db: AngularFirestore,
    private user: UsersService) { }

  createMedication(patientId: string, newMedication: Partial<Medication>,UserId?:string): Observable<any> {
    let save$: Observable<any>;

    save$ = this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/medications`).add(newMedication))
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

  getMedicationsByPatient(patientId: string, UserId?: string): Observable<Medication[]> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/medications`,
          ref => ref.where('archived', '==', false)
            .orderBy('name'))
          .get()),
      first(),
      map(snaps => convertSnaps<Medication>(snaps))
    )
  }

  getMedicationsByType(patientId: string, isRescue: boolean,
    activeMedsOnly: boolean = false,
    nonArchivedOnly: boolean = true, UserId?: string): Observable<Medication[]> {
    if (isRescue && activeMedsOnly) {
      throw new Error("activeMedsOnly can only be true when isRescue is false.")
    }
    let dbQueryFn: QueryFn<firebase.firestore.DocumentData> = ref => {
      let query: Query<firebase.firestore.DocumentData>;
      if (activeMedsOnly)
        query = ref.where("type", "!=", "Rescue")
          .where("active", "==", true)
      else
        query = ref.where("type", (isRescue) ? "==" : "!=", "Rescue")
      if (nonArchivedOnly)
        query = query.where("archived", "==", false)
      return query;
    }
    return this.user.userId$.pipe(
      switchMap(userId =>
        this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/medications`,
          dbQueryFn)
          .get()),
      first(),
      map(snaps => convertSnaps<Medication>(snaps)),
      map(medications => medications.sort((a, b) => ((a.name < b.name) ? -1 : 1)))
    )
  }

  getMedicationsByIds(patientId: string, medicationsIdArray: string[],
    archivedOnly: boolean = false ,UserId?:string): Observable<Medication[]> {
    let idChunks: string[][] = []
    //in clause supports only up to 10 elements in the array. Thus, the following for loop.
    for (let i = 0; i < medicationsIdArray.length; i += 10) {
      idChunks.push(medicationsIdArray.slice(i, i + 10));
    }
    let queryFunction = (medIds) => {
      let dbQueryFn: QueryFn<firebase.firestore.DocumentData> = ref => {
        if (archivedOnly)
          return ref.where(firebase.firestore.FieldPath.documentId(), "in", medIds)
            .where("archived", "==", true)
        else
          return ref.where(firebase.firestore.FieldPath.documentId(), "in", medIds)
      }
      return dbQueryFn
    }
    return this.user.userId$.pipe(
      switchMap(userId => from(idChunks).pipe(
        map(medIds => [UserId ? UserId : userId, medIds]),
        endWith()
      )),
      takeWhile((x) => x != null),
      switchMap(([userId, medIds]) =>
        this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/medications`,
          queryFunction(medIds))
          .get()),
      map(snaps => convertSnaps<Medication>(snaps))
    )
  }

  updateMedication(patientId: string, medicationId: string, changes: Partial<Patient>,UserId?:string): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${UserId ? UserId : userId}/patients/${patientId}/medications/${medicationId}`).update(changes))
      ),
      first()
    );
  }

  archiveMedication(patientId: string, medicationId: string,UserId?:string): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId => {
        return from(this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/medications`)
          .doc(medicationId)
          .update({
            archived: true,
            archiveDate: Timestamp.fromDate(new Date())
          }))
      }
      ),
      first()
    );
  }
}
