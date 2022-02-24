import { Injectable } from '@angular/core';
import firebase from "firebase/compat";
import OrderByDirection = firebase.firestore.OrderByDirection;
import {first, map, Observable} from "rxjs";
import {Episode} from "../models/episode";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {convertSnaps} from "./data-utils";

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {

  constructor(private db: AngularFirestore) { }

  getEpisodesByPatient(userId: string, patientId: string,
                       sortOrder: OrderByDirection = 'asc'): Observable<Episode[]> {
    console.log("userId" + userId);
    console.log("patientId" + patientId);
    return this.db.collection(`users/${userId}/patients/${patientId}/episodes`)
      .get()
      .pipe(
        map(snaps => convertSnaps<Episode>(snaps))
      )
  }
}
