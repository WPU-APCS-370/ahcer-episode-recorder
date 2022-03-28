import { Injectable } from '@angular/core';
import firebase from "firebase/compat";
import OrderByDirection = firebase.firestore.OrderByDirection;
import {first, from, map, Observable, switchMap} from "rxjs";
import {Episode} from "../models/episode";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {convertSnaps} from "./data-utils";
import {UsersService} from "./users.service";
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

  createEpisode(patientId: string, newEpisode: Partial<Episode>): Observable<any> {
    let save$: Observable<any>;

    save$ = this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.collection(`users/${userId}/patients/${patientId}/episodes`).add(newEpisode))
      ),
      first()
    );

    return save$.pipe(
      map(res => {
        return {
          id: res.id,
          ...newEpisode
        };
      })
    );
  }
}
