import { Component, OnInit } from '@angular/core';
import {EpisodeService} from "../services/episode.service";
import {Episode} from "../models/episode";
import {finalize, first, switchMap} from "rxjs";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ViewEpisodeComponent} from "../view-episode/view-episode.component";
import {PatientServices} from "../services/patient.service";
import {UsersService} from "../services/users.service";
import {DeleteEpisodeComponent} from "../delete-episode/delete-episode.component";
import {EditEpisodeComponent} from "../edit-episode/edit-episode.component";


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
  userId: string = '';

  completelyLoaded: boolean = false;
  loading: boolean = false;
  lastPageLoaded = 0;
  displayedColumns = ['startDate', 'endDate', 'duration', 'link'];

  constructor(private dialog: MatDialog,
              private episodeServices: EpisodeService,
              private patientsService: PatientServices,
              private usersService: UsersService) { }

  ngOnInit(): void {
    this.loadFirst20()
  }

  loadFirst20() {
    this.loading = true;
    this.usersService.getLastViewedPatient().pipe(
      switchMap(lastPatient => {
        this.patientId = lastPatient.lastPatientViewed;
        this.userId = lastPatient.lastPatientViewdUserId;
        return this.episodeServices.get20EpisodesByPatient(this.patientId, 'desc',null,this.userId)
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

    this.episodeServices.get20EpisodesByPatient(this.patientId,
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
    return this.episodeServices.calculateDuration(startTime, endTime);
  }

  onViewDetails(episode:Episode) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';

    let uid = this.usersService.isAdmin ? this.userId : null;
    dialogConfig.data = [episode, this.patientId,uid];
    this.dialog
      .open(ViewEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          // this.loadPatients()
        }
      });
  }

  editEpisode(episode: Episode): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';
    dialogConfig.maxWidth = '350px';
    let uid = this.usersService.isAdmin ? this.userId : null;

    dialogConfig.data = [episode, this.patientId, uid];

    this.dialog
      .open(EditEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val)
          this.loadFirst20();
      });
  }

  deleteEpisode(episode: Episode){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = [episode, this.patientId,this.userId];
    this.dialog
      .open(DeleteEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.loadFirst20()
        }
      });
  }
}
