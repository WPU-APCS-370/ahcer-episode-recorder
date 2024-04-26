import {Component, Inject, OnInit} from '@angular/core';
import {catchError, switchMap, tap, throwError} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UsersService} from "../services/users.service";
import {MedicationService} from "../services/medication.service";
import {Medication} from "../models/medication";

@Component({
  selector: 'app-delete-medication',
  templateUrl: './delete-medication.component.html',
  styleUrls: ['./delete-medication.component.scss']
})
export class DeleteMedicationComponent implements OnInit {

  medication: Medication;

  constructor(private dialogRef: MatDialogRef<DeleteMedicationComponent>,
              @Inject(MAT_DIALOG_DATA) medication: Medication,
              private medicationService: MedicationService,
              private userService: UsersService) {
    this.medication = medication;
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  delete(): void {
    this.userService.getLastViewedPatient().pipe(
      switchMap((patientId) => this.medicationService.archiveMedication(patientId, this.medication.id)),
      tap(() => {
        console.log("Deleted medication for: " + this.medication);
        this.dialogRef.close(this.medication);
      }),
      catchError(err => {
        console.log(err);
        alert('could not delete medication.');
        return throwError(err);
      })
    ).subscribe()
  }

}
