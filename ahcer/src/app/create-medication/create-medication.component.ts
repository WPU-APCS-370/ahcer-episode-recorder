import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {PatientServices} from "../services/patient.service";

@Component({
  selector: 'app-create-medication',
  templateUrl: './create-medication.component.html',
  styleUrls: ['./create-medication.component.scss']
})
export class CreateMedicationComponent implements OnInit {

  medicationForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<CreateMedicationComponent>,
              private fb: FormBuilder,
              private patientsService: PatientServices) {
    this.medicationForm =this.fb.group({
      name: ["", Validators.required],
      dose: ["", Validators.required],
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

  }
}
