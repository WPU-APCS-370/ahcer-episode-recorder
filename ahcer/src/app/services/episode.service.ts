import { Injectable } from '@angular/core';
import firebase from "firebase/compat";
import OrderByDirection = firebase.firestore.OrderByDirection;
import {first, from, map, Observable, switchMap} from "rxjs";
import {Episode} from "../models/episode";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {convertSnaps} from "./data-utils";
import {UsersService} from "./users.service";
import Timestamp = firebase.firestore.Timestamp;
import {Patient} from "../models/patient";

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {

  constructor(private db: AngularFirestore,
              private user: UsersService) { }

  getLastFiveEpisodesByPatient(patientId: string,
                       sortOrder: OrderByDirection) : Observable<Episode[]> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
        ref => ref.orderBy('startTime', sortOrder).limit(5))
        .get()),
      first(),
      map(snaps => convertSnaps<Episode>(snaps))
    )
  }

  getEpisodesByPatient(patientId: string,
                       sortOrder: OrderByDirection,
                       lastStartTime?: Timestamp): Observable<Episode[]> {
    if (lastStartTime) {
      return this.user.userId$.pipe(
          switchMap(userId =>
            this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
            ref => ref.orderBy('startTime', sortOrder).startAfter(lastStartTime).limit(21))
            .get()),
          first(),
          map(snaps => convertSnaps<Episode>(snaps))
        )
    }
    else {
      return this.user.userId$.pipe(
        switchMap(userId =>
          this.db.collection(`users/${userId}/patients/${patientId}/episodes`,
          ref => ref.orderBy('startTime', sortOrder).limit(21))
          .get()),
          first(),
          map(snaps => convertSnaps<Episode>(snaps))
        )
    }
  }

  updateEpisode(patientId: string, episodeId: string, changes: Partial<Patient>): Observable<any> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${userId}/patients/${patientId}/episodes/${episodeId}`).update(changes))
      ),
      first()
    );
  }
}
