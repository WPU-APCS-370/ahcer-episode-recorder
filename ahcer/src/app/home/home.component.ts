import { Component, OnInit } from '@angular/core';
import {EpisodeService} from "../services/episode.service";
import {finalize} from "rxjs";
import {Episode} from "../models/episode";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {EditPatientComponent} from "../edit-patient/edit-patient.component";
import {ViewEpisodeComponent} from "../veiw-episode/view-episode.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['startTime', 'endTime', 'id'];
  loading: boolean = false;
  episodes: Episode[];
  episodes_count: number;
  temporaryUserId: string = '7ZA7KNV0fYbo19SXYHkC';
  temporaryPatientId: string = 'UJPtfS0RLVDU5o8zD2jq';


  constructor(private episodeService: EpisodeService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = true;
    this.episodeService.getLastFiveEpisodesByPatient(this.temporaryUserId,
      this.temporaryPatientId, 'desc')
      .pipe(
        finalize(() => {
          this.loading = false;
          this.episodes_count = this.episodes.length;
        })
      )
      .subscribe(
        episodes => {this.episodes = episodes}
      );


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
