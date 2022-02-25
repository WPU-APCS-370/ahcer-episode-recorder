import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Patient} from "../models/patient";
import {PatientServices} from "../services/patient.service";

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
              private patientsService: PatientServices) { }

  ngOnInit(): void {
  }

}
