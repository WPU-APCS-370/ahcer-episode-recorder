import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UsersService} from "../services/users.service";
import {MedicationService} from "../services/medication.service";
import {Medication} from "../models/medication";
import {first, switchMap} from "rxjs";


@Component({
  selector: 'app-edit-medication',
  templateUrl: './edit-medication.component.html',
  styleUrls: ['./edit-medication.component.scss']
})
export class EditMedicationComponent implements OnInit {

  medication: Medication;
  medicationForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<EditMedicationComponent>,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) medication: Medication,
              private usersService: UsersService,
              private medicationService: MedicationService) {
    this.medication = medication;
    this.medicationForm =this.fb.group({
      name: [medication.name, Validators.required],
      doseAmount: [medication.doseInfo?.amount, Validators.required],
      doseUnit: [medication.doseInfo?.unit, Validators.required],
      type: [medication.type, Validators.required],
      active: (medication.type=="Daily")? medication.active : false
    })
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  save(): void {
    const val = this.medicationForm.value;
    const updatedMedication: Partial<Medication> = {
      name: val.name,
      doseInfo: {
        amount: val.doseAmount,
        unit: val.doseUnit
      },
      type: val.type
    };

    if (val.type=="Daily") {
      updatedMedication["active"] = val.active;
    }

    this.usersService.getLastViewedPatient().pipe(
      switchMap(patientId=> this.medicationService.updateMedication(patientId, this.medication.id, updatedMedication)),
      first()
    ).subscribe(() => {
      this.dialogRef.close(updatedMedication);
    });
  }
}


