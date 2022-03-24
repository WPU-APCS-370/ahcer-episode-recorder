import { Component, OnInit } from '@angular/core';
import {PatientServices} from "../services/patient.service";
import {finalize} from "rxjs";
import {Patient} from "../models/patient";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {EditPatientComponent} from "../edit-patient/edit-patient.component";
import {DeletePatientComponent} from "../delete-patient/delete-patient.component";

@Component({
  selector: 'app-view-patient',
  templateUrl: './view-patient.component.html',
  styleUrls: ['./view-patient.component.scss']
})
export class ViewPatientComponent implements OnInit {

  patients: Patient[] | undefined
  loading: boolean = false;

  constructor(private dialog: MatDialog,
              private patientService: PatientServices) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;

    this.patientService.getPatient('7ZA7KNV0fYbo19SXYHkC')
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (result) => this.patients = result
      )
  }

  editPatient(patient: Patient): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = patient;

    this.dialog
      .open(EditPatientComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.loadPatients()
        }
      });
  }

  onDeletePatient(patient: Patient) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = patient;

    this.dialog
      .open(DeletePatientComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.loadPatients()
        }
      });
  }
}
