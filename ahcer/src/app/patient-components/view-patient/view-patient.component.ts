import { Component, OnInit } from '@angular/core';
import {PatientServices} from "../../services/patient.service";
import {finalize} from "rxjs";
import {Patient} from "../../models/patient";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {EditPatientComponent} from "../edit-patient/edit-patient.component";
import {DeletePatientComponent} from "../delete-patient/delete-patient.component";
import {MedicationService} from "../../services/medication.service";
import {Medication} from "../../models/medication";

@Component({
  selector: 'app-view-patient',
  templateUrl: './view-patient.component.html',
  styleUrls: ['./view-patient.component.scss']
})
export class ViewPatientComponent implements OnInit {

  patients: Patient[]
  loading: boolean = false;
  activeMeds: Medication[][]=[];

  constructor(private dialog: MatDialog,
              private patientService: PatientServices,
              private medicationService: MedicationService) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadActiveMeds(){
    for(let i=0; i<this.patients.length; i++){
      let patient = this.patients[i];
      this.medicationService.getMedicationsByType(patient.id, false, true)
        .subscribe((activeMeds)=> {
          this.activeMeds.push(activeMeds)
        })
    }
  }

  loadPatients() {
    this.loading = true;

    this.patientService.getPatients()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (result) => {
          this.patients = result;
          this.loadActiveMeds();
        }
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
