import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import { Episode } from "../models/episode";
import { EpisodeService } from "../services/episode.service";
import { MedicationService } from "../services/medication.service";
import { Medication } from "../models/medication";
import { CreateMedicationComponent } from "../create-medication/create-medication.component";
import { formGroupErrorMatcher } from "../create-episode/create-episode.component";

@Component({
  selector: 'app-edit-episode-free-day',
  templateUrl: './edit-episode-free-day.component.html',
  styleUrls: ['./edit-episode-free-day.component.scss']
})
export class EditEpisodeFreeDayComponent {
  patientId: string;
  episode: Episode;
  userId: string
  episodeForm: UntypedFormGroup;
  constructor(private dialogRef: MatDialogRef<EditEpisodeFreeDayComponent>,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) [episode, patient, userId]: [Episode, string, string],
    private episodeService: EpisodeService,
    private dialog: MatDialog) {
    this.patientId = patient;
    this.userId = userId
    this.episode = episode;

  }
  ngOnInit(): void {
    this.episodeForm = this.fb.group({
      startTime: [this.episode.startTime.toDate(), Validators.required],
      endTime: [(this.episode.endTime) ? this.episode.endTime.toDate() : null],
      notes: [(this.episode.notes) ? this.episode.notes :null]
    });
  }
  close(): void {
    this.dialogRef.close()
  }
  save(): void {

    let updateEpisode = this.episodeForm.value
    // console.log(updateEpisode);
    // return

    this.episodeService.updateEpisode(this.patientId, this.episode.id, updateEpisode, this.userId)
      .subscribe(() => {
        this.dialogRef.close(updateEpisode);
      });
  }
}
