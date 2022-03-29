import { Component, OnInit } from '@angular/core';
import {EpisodeService} from "../services/episode.service";
import {Episode} from "../models/episode";
import {finalize, first, switchMap} from "rxjs";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ViewEpisodeComponent} from "../veiw-episode/view-episode.component";
import {PatientServices} from "../services/patient.service";
import {UsersService} from "../services/users.service";


@Component({
  selector: 'app-view-episodes',
  templateUrl: './view-episodes.component.html',
  styleUrls: ['./view-episodes.component.scss']
})
export class ViewEpisodesComponent implements OnInit {
  episodes: Episode[];
  patientId: string = '';
  lastStartTime : Timestamp;
  episodes_count: number;

  completelyLoaded: boolean = false;
  loading: boolean = false;
  lastPageLoaded = 0;
  displayedColumns = ['startDate', 'endDate', 'duration', 'link'];

  constructor(private dialog: MatDialog,
              private episodeServices: EpisodeService,
              private patientsService: PatientServices,
              private usersService: UsersService) { }

  ngOnInit(): void {
    this.loading = true;
    this.usersService.getLastViewedPatient().pipe(
      switchMap(patientId => {
        this.patientId = patientId;
        return this.episodeServices.getEpisodesByPatient(this.patientId, 'desc')
      }),
      first(),
      finalize(() => {
        this.loading = false;
        this.episodes_count = this.episodes.length;
      })
    )
      .subscribe(
        episodes => {
          this.episodes = episodes.slice(0,20);
          this.completelyLoaded = (episodes.length < 21);
          if (!this.completelyLoaded)
            this.lastStartTime = episodes[19].startTime;
        }
      );
  }

  load20More() {
    this.lastPageLoaded++;
    this.loading = true;

    this.episodeServices.getEpisodesByPatient(this.patientId,
      'desc', this.lastStartTime)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.episodes_count = this.episodes.length;
        })
      )
      .subscribe(episodes => {
        this.episodes = this.episodes.concat(episodes.slice(0,20));
        this.completelyLoaded = (episodes.length < 21);
        if(!this.completelyLoaded)
          this.lastStartTime = episodes[19].startTime;
      });
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

  onViewDetails(episode:Episode) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = episode;
    this.dialog
      .open(ViewEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          // this.loadPatients()
        }
      });
  }
}
