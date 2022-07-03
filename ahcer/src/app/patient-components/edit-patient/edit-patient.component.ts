import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Patient} from "../../models/patient";
import {PatientServices} from "../../services/patient.service";
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html',
  styleUrls: ['./edit-patient.component.scss']
})
export class EditPatientComponent implements OnInit {
  form: FormGroup;
  patient: Patient;

  constructor(private dialogRef: MatDialogRef<EditPatientComponent>,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) patient: Patient,
              private patientsService: PatientServices) {
    this.patient = patient;
    this.form =this.fb.group({
      firstName: [patient.firstName, Validators.required],
      lastName: [patient.lastName, Validators.required],
      gender: patient.gender,
      primaryPhysicianName: patient.primaryPhysicianName,
      primaryPhysicianPhone: patient.primaryPhysicianPhone,
      otherDoctorInfo: patient.otherDoctorInfo,
      birthDate: [patient.birthDate.toDate(),Validators.required],
      dateOfDiagnosis: (patient.dateOfDiagnosis)?patient.dateOfDiagnosis.toDate() : null,
      gene: patient.gene,
      mutation: patient.mutation,
      otherMutation: patient.otherMutation
    })
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  save(): void {
    this.form.value.birthDate = Timestamp.fromDate(this.form.value.birthDate);
    if (this.form.value.dateOfDiagnosis)
      this.form.value.dateOfDiagnosis = Timestamp.fromDate(this.form.value.dateOfDiagnosis);
    const changes = this.form.value;
    this.patientsService.updatePatient(this.patient.id, changes).subscribe(() => {
      this.dialogRef.close(changes);
    });
  }


  }
