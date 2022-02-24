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
  temporaryUserId: string = '7ZA7KNV0fYbo19SXYHkC';
  temporaryPatientId: string = 'UJPtfS0RLVDU5o8zD2jq';


  constructor(private episodeService: EpisodeService) { }

  ngOnInit(): void {
    this.episodeService.getEpisodesByPatient(this.temporaryUserId,
      this.temporaryPatientId, 'desc')
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        episodes => this.episodes = episodes
      );
  }

}
