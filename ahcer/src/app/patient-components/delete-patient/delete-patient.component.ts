import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Patient} from "../../models/patient";
import {PatientServices} from "../../services/patient.service";
import {catchError, iif, of, switchMap, tap, throwError} from "rxjs";
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-delete-patient',
  templateUrl: './delete-patient.component.html',
  styleUrls: ['./delete-patient.component.scss']
})
export class DeletePatientComponent implements OnInit {
  patient: Patient;

  constructor(private dialogRef: MatDialogRef<DeletePatientComponent>,
              @Inject(MAT_DIALOG_DATA) patient: Patient,
              private patientService: PatientServices,
              private usersService: UsersService) {
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
        switchMap(()=> this.usersService.getLastViewedPatient()),
        switchMap(patientId => iif(() => (patientId == this.patient.id),
                  this.patientService.getPatients(),
                  of(null))),
        switchMap(patients => iif(()=> patients!=null,
                  this.usersService.changeLastViewedPatient(
                    (patients.length>0)? patients[0].id : ""
                  ),
                  of(null))),
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
