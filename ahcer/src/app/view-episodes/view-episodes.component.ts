import { Component, OnInit } from '@angular/core';
import {EpisodeService} from "../services/episode.service";
import {Episode} from "../models/episode";
import {finalize} from "rxjs";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ViewEpisodeComponent} from "../veiw-episode/view-episode.component";


@Component({
  selector: 'app-view-episodes',
  templateUrl: './view-episodes.component.html',
  styleUrls: ['./view-episodes.component.scss']
})
export class ViewEpisodesComponent implements OnInit {
  episodes: Episode[];
  temporaryUserId: string = '7ZA7KNV0fYbo19SXYHkC';
  temporaryPatientId: string = 'UJPtfS0RLVDU5o8zD2jq';
  episodes_count: number;

  completelyLoaded: boolean = false;
  loading: boolean = false;
  lastPageLoaded = 0;
  displayedColumns = ['startDate', 'endTime', 'duration', 'link'];

  constructor(private dialog: MatDialog,
              private episodeServices: EpisodeService) { }

  ngOnInit(): void {
    this.loading = true;

    this.episodeServices.getEpisodesByPatient(this.temporaryUserId, this.temporaryPatientId, 'desc')
      .pipe(
        finalize(() => {
          this.loading = false;
          this.episodes_count = this.episodes.length;
        })
      )
      .subscribe(
        episodes => {
          this.episodes = episodes.slice(0,20);
          this.completelyLoaded = (episodes.length==this.episodes.length);
        }
      );
  }

  load20More() {
    this.lastPageLoaded++;
    this.loading = true;

    this.episodeServices.getEpisodesByPatient(this.temporaryUserId, this.temporaryPatientId, 'desc')
      .pipe(
        finalize(() => {
          this.loading = false;
          this.episodes_count = this.episodes.length;
        })
      )
      .subscribe(episodes => {
        this.episodes.concat(episodes.slice(20 * this.lastPageLoaded, 20 + 20 * this.lastPageLoaded));
        this.completelyLoaded = (episodes.length == this.episodes.length);
      });
  }

  calculateDuration(startTime: Timestamp, endTime: Timestamp){
    if (endTime) {

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
