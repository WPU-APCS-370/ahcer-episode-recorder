import { Injectable } from '@angular/core';
import firebase from "firebase/compat";
import OrderByDirection = firebase.firestore.OrderByDirection;
import {first, map, Observable} from "rxjs";
import {Episode} from "../models/episode";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {convertSnaps} from "./data-utils";
import Timestamp = firebase.firestore.Timestamp;

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
                       sortOrder: OrderByDirection,
                       lastStartTime?: Timestamp): Observable<Episode[]> {
    if (lastStartTime) {
      return this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
        ref => ref.orderBy('startTime', sortOrder).startAfter(lastStartTime).limit(21))
        .get()
        .pipe(
          map(snaps => convertSnaps<Episode>(snaps))
        )
    }
    else {
      return this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
        ref => ref.orderBy('startTime', sortOrder).limit(21))
        .get()
        .pipe(
          map(snaps => convertSnaps<Episode>(snaps))
        )
    }
  }
}
