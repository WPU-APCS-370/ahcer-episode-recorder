import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Patient} from "../models/patient";
import {PatientServices} from "../services/patient.service";
import {catchError, tap, throwError} from "rxjs";

@Component({
  selector: 'app-delete-patient',
  templateUrl: './delete-patient.component.html',
  styleUrls: ['./delete-patient.component.scss']
})
export class DeletePatientComponent implements OnInit {
  patient: Patient;

  constructor(private dialogRef: MatDialogRef<DeletePatientComponent>,
              @Inject(MAT_DIALOG_DATA) patient: Patient,
              private patientService: PatientServices) {
    this.patient = patient;
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  delete(): void {
    this.patientService.deletePatient(this.patient.id)
      .pipe(
        tap(() => {
          console.log("Deleted patient: " + this.patient.firstName + " " + this.patient.lastName);
          this.dialogRef.close(this.patient.id);
        }),
        catchError(err => {
          console.log(err);
          alert('could not delete patient.');
          return throwError(err);
        })
      )
      .subscribe()
  }

}
