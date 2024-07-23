import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Episode} from "../models/episode";
import {MedicationService} from "../services/medication.service";
import {Medication} from "../models/medication";

@Component({
  selector: 'app-view-episode',
  templateUrl: './view-episode.component.html',
  styleUrls: ['./view-episode.component.scss']
})
export class ViewEpisodeComponent implements OnInit {
  episode: Episode;
  patientId: string;
  userId:string;
  rescueMeds: Medication[]=[];
  rescueMedsDosesAndTimes: Object={};
  loadingMeds: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) [episode, patientId,userId]: [Episode, string,string],
              private dialogRef: MatDialogRef<ViewEpisodeComponent>,
              private medicationService: MedicationService) {
    this.episode = episode;
    this.patientId = patientId;
    this.userId=userId
    this.loadRescueMeds()
  }

  close(): void {
    this.dialogRef.close()
  }

  ngOnInit(): void {

  }

  loadRescueMeds() {
    if(this.episode.medications && Object.keys(this.episode.medications).length > 0)
    {
      let medications = this.episode.medications;
      if(medications.rescueMeds) {
        this.loadingMeds = true;
        for(let med of medications.rescueMeds) {
          this.rescueMedsDosesAndTimes[med.id] = {doseInfo: med.doseInfo, time: med.time.toDate()};
        }
        this.medicationService.getMedicationsByIds(this.patientId,
          medications.rescueMeds.map((x)=> x.id),false,this.userId)
          .subscribe({
            next: (rescueMeds)=> {
              this.rescueMeds = this.rescueMeds.concat(rescueMeds)
            },
            complete: () => {
              this.rescueMeds.sort((a, b) => ((a.name < b.name)? -1 : 1));
              this.loadingMeds = false;
            }
          })
      }
    }
  }

  jsonObjectIsEmpty(object: Object) {
    return !object || (Object.keys(object).length <=0);
  }
}
