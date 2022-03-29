import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PatientServices} from "../services/patient.service";
import {Router} from "@angular/router";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import {catchError, first, Observable, switchMap, tap, throwError} from "rxjs";
import {EpisodeService} from "../services/episode.service";
import {Episode} from "../models/episode";
import {Patient} from "../models/patient";
import {UsersService} from "../services/users.service";

@Component({
  selector: 'app-create-episode',
  templateUrl: './create-episode.component.html',
  styleUrls: ['./create-episode.component.scss']
})
export class CreateEpisodeComponent implements OnInit{
  symptomLabels = ["Left Arm", "Right Arm", "Left Leg", "Right Leg",
                   "Left Hand", "Right Hand", "Eyes"]
  patient$: Observable<Patient>

  episodeForm =this.fb.group({
    startTime: [null, Validators.required],
    endTime: [null],
    symptomGroup: this.symptomGroup(),
    trigger: false,
    triggerGroup: this.fb.group({
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
    }),
    medication: false,
    medicationGroup: this.fb.group({
      vallumOral: false,
      vallumOther: false,
      midezolom: false,
      additionalMedication: ""
    })
  });

  symptomGroup(): FormGroup {
    let controls = {}
    for(let label of this.symptomLabels) {
      controls[label+' Checkbox'] = false;
      controls[label+' Dropdown'] = ['']
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

  constructor(private fb: FormBuilder,
              private episodeService: EpisodeService,
              private patientService: PatientServices,
              private usersService: UsersService,
              private router: Router) {
    this.patient$ = usersService.getLastViewedPatient()
      .pipe(
        switchMap(patientId => patientService.getPatientById(patientId))
      )
  }

  ngOnInit(): void {
  }

  onCreateEpisode() {
    const val = this.episodeForm.value;
    let symptomKeys = ["leftArm", "rightArm", "leftLeg", "rightLeg",
                       "leftHand", "rightHand", "eyes"]
    let symptoms = {
      eyes: '',
      leftArm: '',
      leftHand: '',
      leftLeg: '',
      rightArm: '',
      rightHand: '',
      rightLeg: ''
    }

    for (var index in symptomKeys) {
      if(val.symptomGroup[this.symptomLabels[index]+' Checkbox']===true) {
        symptoms[symptomKeys[index]] = val.symptomGroup[this.symptomLabels[index]
                                                        +' Dropdown']
      }
      else {
        symptoms[symptomKeys[index]] = ""
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

    const newEpisode: Partial<Episode> = {
      symptoms: symptoms,
      otherMedication: (val.medication)? val.medicationGroup.additionalMedication : "",
      otherTrigger: (val.trigger)?  val.triggerGroup.additionalTriggers : "",
      knownTriggers: triggers,
      rescueMedication: medications
    };

    newEpisode.startTime = Timestamp.fromDate(val.startTime);
    if(val.endTime)
      newEpisode.endTime = Timestamp.fromDate(val.endTime);

    this.usersService.getLastViewedPatient().pipe(
      switchMap(patientId=> this.episodeService.createEpisode(patientId, newEpisode)),
      first(),
      tap(() => this.router.navigateByUrl('/')),
      catchError(err => {
        console.log(err);
        alert('Could not add new episode.');
        return throwError(err);
      })
    ).subscribe();
  }

}


