import { Injectable } from '@angular/core';
import {first, map, Observable, switchMap} from "rxjs";
import {convertSnaps} from "./data-utils";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {UsersService} from "./users.service";
import {Medication} from "../models/medication";

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  constructor(private db: AngularFirestore,
              private user: UsersService) { }

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
}
