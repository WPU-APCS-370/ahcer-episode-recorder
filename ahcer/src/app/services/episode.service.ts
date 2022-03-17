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

  getLastFiveEpisodesByPatient(userId: string, patientId: string,
                       sortOrder: OrderByDirection): Observable<Episode[]> {
    return this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
      ref => ref.orderBy('startTime', sortOrder).limit(5))
      .get()
      .pipe(
        map(snaps => convertSnaps<Episode>(snaps))
      )
  }

  getEpisodesByPatient(userId: string, patientId: string,
                               sortOrder: OrderByDirection): Observable<Episode[]> {
    return this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
      ref => ref.orderBy('startTime', sortOrder))
      .get()
      .pipe(
        map(snaps => convertSnaps<Episode>(snaps))
      )
  }
}
