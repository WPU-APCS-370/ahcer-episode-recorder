import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {PatientServices} from "../../services/patient.service";
import {Router} from "@angular/router";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import {catchError, first, switchMap, tap, throwError} from "rxjs";
import {EpisodeService} from "../../services/episode.service";
import {Episode} from "../../models/episode";
import {Patient} from "../../models/patient";
import {UsersService} from "../../services/users.service";
import {MedicationService} from "../../services/medication.service";
import {Medication} from "../../models/medication";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CreateMedicationComponent} from "../../medication-components/create-medication/create-medication.component";
import {ErrorStateMatcher} from "@angular/material/core";

export class formGroupErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null) {
    const formGroup = control.parent.controls;
    const name = Object.keys(formGroup).find(name => control === formGroup[name]) || null;
    return control.touched && control.parent.hasError(name+" Error");
  }
}

@Component({
  selector: 'app-create-episode',
  templateUrl: './create-episode.component.html',
  styleUrls: ['./create-episode.component.scss']
})
export class CreateEpisodeComponent implements OnInit{
  symptomLabels = ["Full Body", "Left Arm", "Right Arm", "Left Leg", "Right Leg",
                   "Left Hand", "Right Hand", "Eyes", "Loss of Consciousness", "Seizure"];
  loadingPatient: boolean = false;
  loadingRescueMeds: boolean = false;
  loadingPrescriptionMeds: boolean = false;
  patient: Patient;
  rescueMedications: Medication[] = [];
  prescriptionMeds: Medication[] = [];
  formGroupErrorMatcher: formGroupErrorMatcher = new formGroupErrorMatcher();

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
    rescueMedToggle: false,
    rescueMedGroup: this.rescueMedGroup(),
    behavior: ""
  });

  symptomGroup(): FormGroup {
    let controls = {}
    for(let label of this.symptomLabels) {
      controls[label+' Checkbox'] = false;
      if (label!="Seizure" && label!="Loss of Consciousness")
        controls[label+' Dropdown'] = ['']
      controls[label+' Time'] = null
    }
    let options = {
      validators: (formGroup: FormGroup) => {
        let checked = 0;
        let errors = {};
        for (let label of this.symptomLabels) {
          let checkbox = formGroup.controls[label+' Checkbox']
          let checkboxChecked = (checkbox.value === true)
          let dropdownValueEmpty = false;
          if (label!="Seizure" && label!="Loss of Consciousness") {
            let dropdown = formGroup.controls[label + ' Dropdown']
            dropdownValueEmpty = (dropdown.value === '')
          }
          if(checkboxChecked) {
            checked++;
          }
          if (checkboxChecked && dropdownValueEmpty) {
            errors[label+' Dropdown Error']=true;
          }
        }
        if (checked < 1){
          return {
            requireCheckboxesToBeChecked: true
          };
        }
        else if(Object.keys(errors).length > 0) {
          return errors;
        }

        return null;
      }
    }
    return this.fb.group(controls, options);
  }

  rescueMedGroup(): FormGroup {
    let controls = {}
    for(let i=0; i < this.rescueMedications.length; i++) {
      let medication = this.rescueMedications[i];
      controls['med-'+i+'-checkbox'] = false;
      controls['med-'+i+'-dose-amount'] = [medication.doseInfo.amount];
      controls['med-'+i+'-dose-unit'] = [medication.doseInfo.unit];
      controls['med-'+i+'-time'] = [null];
    }
    let options = {
      validators: this.medicationValidator()
    }
    return this.fb.group(controls, options);
  }

   medicationValidator() {
     return (formGroup: FormGroup) =>
     {
       let checked = 0;
       let errors = {};
       for (let i=0; i < this.rescueMedications.length; i++) {
         let checkbox = formGroup.controls['med-' + i + '-checkbox']
         let checkboxChecked = (checkbox?.value === true)
         let doseAmount = formGroup.controls['med-' + i + "-dose-amount"];
         let doseEmpty = (doseAmount?.value === null)

         if (checkboxChecked) {
           checked++;
         }
         if (checkboxChecked && doseEmpty) {
           errors['med-' + i + "-dose-amount Error"] = true;
         }
       }
       if (checked < 1) {
         return {
           requireCheckboxesToBeChecked: true
         };
       }
       else if(Object.keys(errors).length > 0) {
         return errors;
       }

       return null;
     }
   }

  constructor(private fb: FormBuilder,
              private episodeService: EpisodeService,
              private patientService: PatientServices,
              private usersService: UsersService,
              private medicationService: MedicationService,
              private router: Router,
              private dialog: MatDialog) {
    this.loadingPatient = true;
    usersService.getLastViewedPatient()
      .pipe(
        switchMap(patientId => patientService.getPatientById(patientId))
      )
      .subscribe( (patient) => {
        this.patient = patient;
        this.loadingPatient = false;
      })

    this.loadRescueMeds();
    this.loadActivePrescriptionMeds();
  }

  onMedToggleChange(value: boolean) {
    if(!value) {
      this.episodeForm.get('rescueMedGroup').clearValidators();
      this.episodeForm.get('rescueMedGroup').updateValueAndValidity();
    }
    else {
      this.episodeForm.get('rescueMedGroup').setValidators(this.medicationValidator());
      this.episodeForm.get('rescueMedGroup').updateValueAndValidity();
    }
  }

  ngOnInit(): void {
  }

  loadRescueMeds() {
    this.loadingRescueMeds = true;
    this.usersService.getLastViewedPatient().pipe(
      switchMap(patientId =>
        this.medicationService.getMedicationsByType(patientId, true)
      ),
      first()
    ).subscribe(
      medications => {
        this.rescueMedications = medications;
        this.episodeForm.removeControl("rescueMedGroup");
        this.episodeForm.addControl("rescueMedGroup", this.rescueMedGroup())
        this.onMedToggleChange(this.episodeForm.value.medicationToggle)
        this.loadingRescueMeds = false;
      }
    )
  }

  loadActivePrescriptionMeds() {
    this.loadingPrescriptionMeds = true;
    this.usersService.getLastViewedPatient().pipe(
      switchMap(patientId =>
        this.medicationService.getMedicationsByType(patientId, false, true)
      ),
      first()
    ).subscribe(
      activeMeds => {
        this.prescriptionMeds = activeMeds;
        this.loadingPrescriptionMeds = false;
      }
    )
  }

  createRescueMed() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';

    dialogConfig.data = {isRescue: true};

    this.dialog
      .open(CreateMedicationComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.loadRescueMeds()
        }
      });
  }

  onCreateEpisode() {
    const val = this.episodeForm.value;
    let symptomKeys = ["fullBody", "leftArm", "rightArm", "leftLeg", "rightLeg",
                       "leftHand", "rightHand", "eyes", "seizure", "lossOfConsciousness"]
    let symptoms : Episode['symptoms'] = {
      seizure: {},
      lossOfConsciousness:{},
      fullBody: {},
      eyes: {},
      leftArm: {},
      leftHand: {},
      leftLeg: {},
      rightArm: {},
      rightHand: {},
      rightLeg: {}
    }

    for (let index in symptomKeys) {
      let symptom = {}
      if(val.symptomGroup[this.symptomLabels[index]+' Checkbox']===true) {
        if (symptomKeys[index] != 'seizure' && symptomKeys[index] != 'lossOfConsciousness') {
            symptom['type'] = val.symptomGroup[this.symptomLabels[index] + ' Dropdown'];
        } else {
          symptom['present'] = true;
        }
        if(val.symptomGroup[this.symptomLabels[index] + ' Time'])
          symptom['time'] = Timestamp.fromDate(val.symptomGroup[this.symptomLabels[index] + ' Time']);
        else
          symptom['time'] = Timestamp.fromDate(val.startTime);
      }
      symptoms[symptomKeys[index]] = symptom;
    }

    let triggers : [string] = ['']

    if (val.trigger === true) {
      let firstValue = true;
      for (let key in val.triggerGroup) {
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

    let prescriptionMeds = [];
    let rescueMeds = [];

    for (let med of this.prescriptionMeds) {
      prescriptionMeds.push({
        name: med.name,
        doseInfo: {
          amount: med.doseInfo.amount,
          unit: med.doseInfo.unit
        }
      });
    }

    if (val.rescueMedToggle === true) {
      for (let i=0; i < this.rescueMedications.length; i++) {
        if(val.rescueMedGroup['med-'+i+'-checkbox']===true) {
          let medication = this.rescueMedications[i];
          let time: Timestamp;
          if (val.rescueMedGroup['med-' + i + '-time'])
            time = Timestamp.fromDate(val.rescueMedGroup['med-' + i + '-time']);
          else
            time = Timestamp.fromDate(val.startTime);
          rescueMeds.push({
            id: medication.id,
            doseInfo: {
              amount: val.rescueMedGroup['med-' + i + '-dose-amount'],
              unit: val.rescueMedGroup['med-' + i + '-dose-unit']
            },
            time: time
          })
        }
      }
    }

    let medications = {}

    if (prescriptionMeds.length > 0)
      medications['prescriptionMeds'] = prescriptionMeds;
    if (rescueMeds.length > 0)
      medications['rescueMeds'] = rescueMeds;

    const newEpisode: Partial<Episode> = {
      symptoms: symptoms,
      otherTrigger: (val.trigger)?  val.triggerGroup.additionalTriggers : "",
      knownTriggers: triggers,
      behavior: val.behavior
    };

    newEpisode.startTime = Timestamp.fromDate(val.startTime);
    if(val.endTime)
      newEpisode.endTime = Timestamp.fromDate(val.endTime);
    if(Object.keys(medications).length != 0)
      newEpisode.medications = medications

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


