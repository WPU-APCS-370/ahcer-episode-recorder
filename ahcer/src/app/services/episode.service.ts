import { Injectable } from '@angular/core';
import firebase from "firebase/compat";
import OrderByDirection = firebase.firestore.OrderByDirection;
import { first, from, map, Observable, switchMap } from "rxjs";
import { Episode } from "../models/episode";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { convertSnaps } from "./data-utils";
import { UsersService } from "./users.service";
import Timestamp = firebase.firestore.Timestamp;
import { Patient } from "../models/patient";

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {

  constructor(private db: AngularFirestore,
    private user: UsersService) { }

  getLastFiveEpisodesByPatient(patientId: string,
    sortOrder: OrderByDirection, UserId?: string,): Observable<Episode[]> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/episodes`,
          ref => ref.orderBy('startTime', sortOrder).limit(5))
          .get()),
      first(),
      map(snaps => convertSnaps<Episode>(snaps))
    )
  }

  createEpisode(patientId: string, newEpisode: Partial<Episode>,UserId?:string): Observable<any> {
    let save$: Observable<any>;

    save$ = this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/episodes`).add(newEpisode))
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

  get20EpisodesByPatient(patientId: string,
    sortOrder: OrderByDirection,
    lastStartTime?: Timestamp,UserId?:string): Observable<Episode[]> {
    if (lastStartTime) {
      return this.user.userId$.pipe(
        switchMap(userId =>
          this.db.collection(`users/${ UserId ? UserId : userId}/patients/${patientId}/episodes`,
            ref => ref.orderBy('startTime', sortOrder).startAfter(lastStartTime).limit(21))
            .get()),
        first(),
        map(snaps => convertSnaps<Episode>(snaps))
      )
    }
    else {
      return this.user.userId$.pipe(
        switchMap(userId =>
          this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/episodes`,
            ref => ref.orderBy('startTime', sortOrder).limit(21))
            .get()),
        first(),
        map(snaps => convertSnaps<Episode>(snaps))
      )
    }
  }

  getAllEpisodesByPatient(patientId: string,
    sortOrder: OrderByDirection, UserId?: string): Observable<Episode[]> {
    return this.user.userId$.pipe(
      switchMap(userId =>
        this.db.collection(`users/${UserId ? UserId : userId}/patients/${patientId}/episodes`,
          ref => ref.orderBy('startTime', sortOrder))
          .get()),
      first(),
      map(snaps => convertSnaps<Episode>(snaps))
    )
  }

  updateEpisode(patientId: string, episodeId: string, changes: Partial<Patient>, UserId?: string): Observable<any> {

    return this.user.userId$.pipe(
      switchMap(userId =>
        from(this.db.doc(`users/${UserId ? UserId : userId}/patients/${patientId}/episodes/${episodeId}`).update(changes))
      ),
      first()
    );
  }

  deleteEpisode(patientId: string, episodeId: string, UserId?: string): Observable<any> {
    console.log(UserId)
    return this.user.userId$.pipe(
      switchMap(userId => {
        return from(this.db.doc(`users/${UserId ? UserId : userId}/patients/${patientId}/episodes/${episodeId}`).delete())
      }
      ),
      first()
    );
  }

  calculateDuration(startTime: Timestamp, endTime: Timestamp) {
    if (endTime) {
      let time = endTime.seconds - startTime.seconds
      let day = Math.floor(time / (24 * 3600))
      time = time % (24 * 3600)
      let hour = Math.floor(time / 3600)
      time %= 3600
      let minutes = Math.floor(time / 60)
      time %= 60
      let seconds = time
      if (day > 0) {
        if (minutes >= 30) {
          hour += 1
          if (hour == 24) {
            day += 1
            hour = 0
          }
        }
        return `${day} days ${hour} hrs`
      }

      else if (hour > 0) {
        if (seconds >= 30) {
          minutes += 1
          if (minutes == 60) {
            hour += 1
            minutes = 0
          }
        }
        if (hour == 24) {
          day += 1
          hour = 0
          return `${day} days ${hour} hrs`
        }
        else {
          return `${hour} hrs ${minutes} mins`
        }
      }

      else if (minutes > 0) {
        return `${minutes} mins ${seconds} secs`
      }
      else {
        return `${seconds} secs`
      }
    }
    else {
      return null;
    }
  }
}
