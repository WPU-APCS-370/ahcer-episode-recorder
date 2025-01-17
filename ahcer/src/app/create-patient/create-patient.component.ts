import { Component, OnInit } from '@angular/core';
import {UntypedFormBuilder, Validators} from "@angular/forms";
import {PatientServices} from "../services/patient.service";
import {Router} from "@angular/router";
import {Patient} from "../models/patient";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import {catchError, switchMap, tap, throwError} from "rxjs";
import {UsersService} from "../services/users.service";

@Component({
  selector: 'app-create-patient',
  templateUrl: './create-patient.component.html',
  styleUrls: ['./create-patient.component.scss']
})
export class CreatePatientComponent implements OnInit {

  patientForm =this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    gender: [''],
    birthDate: [null, Validators.required],
    dateOfDiagnosis: [null],
    gene:[''],
    mutation: [''],
    otherMutation: [''],
    primaryPhysicianName: [''],
    primaryPhysicianPhone: [''],
    otherDoctorInfo: ['']
  });

  constructor(private fb: UntypedFormBuilder,
              private patientService: PatientServices,
              private usersService: UsersService,
              private router: Router) { }

  ngOnInit(): void {
  }

  onCreatePatient() {
    const val = this.patientForm.value;
    const newPatient: Partial<Patient> = {
      firstName: val.firstName,
      lastName: val.lastName,
      gender: val.gender,
      primaryPhysicianName: val.primaryPhysicianName,
      primaryPhysicianPhone: val.primaryPhysicianPhone,
      otherDoctorInfo: val.otherDoctorInfo,
      gene: val.gene,
      mutation: val.mutation,
      otherMutation: (val.mutation=='Other')? val.otherMutation : ''
    };

    newPatient.birthDate = Timestamp.fromDate(val.birthDate);
    if(val.dateOfDiagnosis)
      newPatient.dateOfDiagnosis = Timestamp.fromDate(val.dateOfDiagnosis);

    this.patientService.createPatient(newPatient)
      .pipe(
        switchMap((res) => this.usersService.changeLastViewedPatient(res.id)),
        tap(() => this.router.navigateByUrl('/patients')),
        catchError(err => {
          console.log(err);
          alert('Could not add new patient.');
          return throwError(err);
        })
      )
      .subscribe();
  }

}
