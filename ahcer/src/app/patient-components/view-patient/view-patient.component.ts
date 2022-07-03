import { Component, OnInit } from '@angular/core';
import {PatientServices} from "../../services/patient.service";
import {finalize, iif, Observable, of, switchMap} from "rxjs";
import {Patient} from "../../models/patient";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {EditPatientComponent} from "../edit-patient/edit-patient.component";
import {MedicationService} from "../../services/medication.service";
import {Medication} from "../../models/medication";
import {DeleteModelOpener} from "../../helper-components/template-delete-modal/template-delete-modal.component";
import {UsersService} from "../../services/users.service";

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
              private usersService: UsersService,
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
    const prompt: string = `Are you sure you want to delete your patient ${patient.firstName} ${patient.lastName}?`;
    const deleteHandle$: Observable<any> = this.patientService.deletePatient(patient.id)
      .pipe(
        switchMap(() => this.usersService.getLastViewedPatient()),
        switchMap(patientId => iif(() => (patientId == patient.id),
          this.patientService.getPatients(),
          of(null))),
        switchMap(patients => iif(() => patients != null,
          this.usersService.changeLastViewedPatient(
            (patients.length > 0) ? patients[0].id : ""
          ),
          of(null)))
      );
    const onDialogResult: () => void = this.loadPatients.bind(this);

    let deleteModelOpener: DeleteModelOpener = new DeleteModelOpener(this.dialog);
    deleteModelOpener.openModal('Patient', prompt, deleteHandle$, onDialogResult);
  }
}
