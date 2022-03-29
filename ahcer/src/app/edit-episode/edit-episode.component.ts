import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Patient} from "../models/patient";
import {PatientServices} from "../services/patient.service";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import {Episode} from "../models/episode";
import {EpisodeService} from "../services/episode.service";
import {UsersService} from "../services/users.service";
import {trigger} from "@angular/animations";
import {update} from "@angular/fire/database";
import {first, switchMap} from "rxjs";

@Component({
  selector: 'app-edit-episode',
  templateUrl: './edit-episode.component.html',
  styleUrls: ['./edit-episode.component.scss']
})
export class EditEpisodeComponent implements OnInit {
  tempPatientId: string ="JZCoEXypgR4eCpll04Rx"
  episode : Episode;
  symptomLabels = ["Left Arm", "Right Arm", "Left Leg", "Right Leg",
    "Left Hand", "Right Hand", "Eyes"]
  symptomKeys = ["leftArm", "rightArm", "leftLeg", "rightLeg",
    "leftHand", "rightHand", "eyes"]

  episodeForm : FormGroup;

  symptomGroup(episode: Episode): FormGroup {
    let controls = {}
    for(let index in this.symptomLabels) {
      let label = this.symptomLabels[index];
      if(episode.symptoms && episode.symptoms[this.symptomKeys[index]]) {
        controls[label + ' Checkbox'] = true;
        controls[label + ' Dropdown'] = [episode.symptoms[this.symptomKeys[index]]];
      }
      else {
        controls[label + ' Checkbox'] = false;
        controls[label + ' Dropdown'] = [''];
      }
    }
    let options = {
      validators: (formGroup: FormGroup) => {
        let checked = 0;
        for (let label of this.symptomLabels) {
          let checkbox = formGroup.controls[label+' Checkbox']
          let dropdown = formGroup.controls[label+' Dropdown']
          let checkboxChecked = (checkbox.value === true)
          let dropdownValueEmpty = (dropdown.value==='')
          if(checkboxChecked && !dropdownValueEmpty) {
            checked++;
          }
          else if (checkboxChecked && dropdownValueEmpty) {
            return {
              requireDropdownToBeSelected: true
            };
          }
        }
        if (checked < 1){
          return {
            requireCheckboxesToBeChecked: true
          };
        }
        return null;
      }
    }
    return this.fb.group(controls, options);
  }

  constructor(private dialogRef: MatDialogRef<EditEpisodeComponent>,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) episode: Episode,
              private episodeService: EpisodeService,
              private patientService: PatientServices,
              private userService: UsersService) {
    this.episode = episode;
    let triggerGroup = {
      food: false,
      light: false,
      anxiety: false,
      medication: false,
      stress: false,
      excitement: false,
      menstruation: false,
      temperature: false,
      water: false,
      additionalTriggers: ""
    }

    if (episode.knownTriggers && episode.knownTriggers[0]) {
      for(let trigger of episode.knownTriggers) {
        triggerGroup[trigger] = true;
      }
    }
    if(episode.otherTrigger) {
      triggerGroup["additionalTriggers"] = episode.otherTrigger;
    }


    let medicationGroup = {
      vallumOral: false,
      vallumOther: false,
      midezolom: false,
      additionalMedication: ""
    }

    if (episode.rescueMedication && episode.rescueMedication[0]) {
      for(let medication of episode.rescueMedication) {
        medicationGroup[medication] = true;
      }
    }
    if(episode.otherMedication) {
      medicationGroup["additionalMedication"] = episode.otherMedication;
    }

    this.episodeForm =this.fb.group({
      startTime: [episode.startTime.toDate(), Validators.required],
      endTime: [(episode.endTime)? episode.endTime.toDate() : null],
      symptomGroup: this.symptomGroup(this.episode),
      trigger: Boolean((episode.knownTriggers && episode.knownTriggers[0]) ||
                        episode.otherTrigger),
      triggerGroup: this.fb.group(triggerGroup),
      medication: Boolean((episode.rescueMedication && episode.rescueMedication[0]) ||
        episode.otherMedication),
      medicationGroup: this.fb.group(medicationGroup)
    });

    console.log(triggerGroup)
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  save(): void {

    const val = this.episodeForm.value;
    let symptoms = {
      eyes: '',
      leftArm: '',
      leftHand: '',
      leftLeg: '',
      rightArm: '',
      rightHand: '',
      rightLeg: ''
    }

    for (var index in this.symptomKeys) {
      if(val.symptomGroup[this.symptomLabels[index]+' Checkbox']===true) {
        symptoms[this.symptomKeys[index]] = val.symptomGroup[this.symptomLabels[index]
        +' Dropdown']
      }
      else {
        symptoms[this.symptomKeys[index]] = ""
      }
    }

    let triggers : [string] = ['']

    if (val.trigger === true) {
      let firstValue = true;
      for (var key in val.triggerGroup) {
        if (val.triggerGroup[key] === true) {
          if (firstValue)
          {
            triggers[0] = key;
            firstValue = false;
          }
          else
            triggers.push(key)
        }
      }
    }

    let medications: [string] = ['']

    if (val.medication === true) {
      let firstValue = true;
      for (var key in val.medicationGroup) {
        if (val.medicationGroup[key] === true) {
          if (firstValue) {
            medications[0] = key;
            firstValue = false;
          }
          else {
            medications.push(key);
          }
        }
      }
    }

    const updateEpisode: Partial<Episode> = {
      symptoms: symptoms,
      otherMedication: (val.medication)? val.medicationGroup.additionalMedication : "",
      otherTrigger: (val.trigger)?  val.triggerGroup.additionalTriggers : "",
      knownTriggers: triggers,
      rescueMedication: medications
    };

    updateEpisode.startTime = Timestamp.fromDate(val.startTime);
    if(val.endTime)
      updateEpisode.endTime = Timestamp.fromDate(val.endTime);

    this.userService.getLastViewedPatient().pipe(
      switchMap( patientId =>
        this.episodeService.updateEpisode(patientId, this.episode.id, updateEpisode)
      ),
      first()
    ).subscribe(() => {
      this.dialogRef.close(updateEpisode);
    });
  }


}
