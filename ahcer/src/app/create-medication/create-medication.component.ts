import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {Medication} from "../models/medication";
import {catchError, first, switchMap, tap, throwError} from "rxjs";
import {UsersService} from "../services/users.service";
import {MedicationService} from "../services/medication.service";

@Component({
  selector: 'app-create-medication',
  templateUrl: './create-medication.component.html',
  styleUrls: ['./create-medication.component.scss']
})
export class CreateMedicationComponent implements OnInit {

  medicationForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<CreateMedicationComponent>,
              private fb: FormBuilder,
              private usersService: UsersService,
              private medicationService: MedicationService) {
    this.medicationForm =this.fb.group({
      name: ["", Validators.required],
      doseAmount: ["", Validators.required],
      doseUnit:["", Validators.required],
      type: ["", Validators.required],
      active: false
    })
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  add(): void {
    const val = this.medicationForm.value;
    const newMedication: Partial<Medication> = {
      name: val.name,
      doseInfo: {
        amount: val.doseAmount,
        unit: val.doseUnit
      },
      type: val.type
    };

    if (val.type=="Daily") {
      newMedication["active"] = val.active;
    }

    this.usersService.getLastViewedPatient().pipe(
      switchMap(patientId=> this.medicationService.createMedication(patientId, newMedication)),
      first(),
      tap((res) => this.dialogRef.close(res)),
      catchError(err => {
        console.log(err);
        alert('Could not add new episode.');
        return throwError(err);
      })
    ).subscribe();
  }
}
