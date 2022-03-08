import { Component, OnInit } from '@angular/core';
import {EpisodeService} from "../services/episode.service";
import {finalize} from "rxjs";
import {Episode} from "../models/episode";

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


  constructor(private episodeService: EpisodeService) { }

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

}