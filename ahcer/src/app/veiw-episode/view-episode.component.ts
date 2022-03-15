import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Patient} from "../models/patient";
import {Episode} from "../models/episode";

@Component({
  selector: 'app-veiw-episode',
  templateUrl: './view-episode.component.html',
  styleUrls: ['./view-episode.component.scss']
})
export class ViewEpisodeComponent implements OnInit {
  episode: Episode;

  constructor(@Inject(MAT_DIALOG_DATA) episode: Episode,
              private dialogRef: MatDialogRef<ViewEpisodeComponent>) {
    this.episode = episode;
  }

  close(): void {
    this.dialogRef.close()
  }

  ngOnInit(): void {

  }

}
