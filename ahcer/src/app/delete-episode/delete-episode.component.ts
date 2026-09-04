import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { catchError, switchMap, tap, throwError } from "rxjs";
import { Episode } from "../models/episode";
import { EpisodeService } from "../services/episode.service";
import { UsersService } from "../services/users.service";

@Component({
  selector: 'app-delete-episode',
  templateUrl: './delete-episode.component.html',
  styleUrls: ['./delete-episode.component.scss']
})


export class DeleteEpisodeComponent implements OnInit {
  episode: Episode;
  userId: string;
  patientId: string;
  constructor(private dialogRef: MatDialogRef<DeleteEpisodeComponent>,
    @Inject(MAT_DIALOG_DATA) [episode, patientId,userId]: [Episode, string,string],
    private episodeService: EpisodeService,
    private userService: UsersService) {
    this.episode = episode;
    this.userId = userId
    this.patientId = patientId
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  delete(): void {
    this.episodeService.deleteEpisode(this.patientId, this.episode.id, this.userId).pipe(
      tap(() => {
        console.log("Deleted episode for: " + this.episode);
        this.dialogRef.close(this.episode);
      }),
      catchError(err => {
        console.log(err);
        alert('could not delete episode.');
        return throwError(err);
      })).subscribe();

    // this.userService.getLastViewedPatient(this.userId).pipe(
    //   switchMap((patientId) => this.episodeService.deleteEpisode(patientId, this.episode.id, this.userId)),
    //   tap(() => {
    //     console.log("Deleted episode for: " + this.episode);
    //     this.dialogRef.close(this.episode);
    //   }),
    //   catchError(err => {
    //     console.log(err);
    //     alert('could not delete episode.');
    //     return throwError(err);
    //   })
    // ).subscribe()
  }

}
