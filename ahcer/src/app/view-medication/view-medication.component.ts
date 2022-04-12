import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {PatientServices} from "../services/patient.service";
import {UsersService} from "../services/users.service";
import {finalize, first, switchMap, tap} from "rxjs";
import {Medication} from "../models/medication";
import {MedicationService} from "../services/medication.service";
import {Patient} from "../models/patient";
import {CreateMedicationComponent} from "../create-medication/create-medication.component";
import {Episode} from "../models/episode";
import {DeleteEpisodeComponent} from "../delete-episode/delete-episode.component";
import {DeleteMedicationComponent} from "../delete-medication/delete-medication.component";
import {EditMedicationComponent} from "../edit-medication/edit-medication.component";

@Component({
  selector: 'app-view-medication',
  templateUrl: './view-medication.component.html',
  styleUrls: ['./view-medication.component.scss']
})
export class ViewMedicationComponent implements OnInit {

  medications: Medication[];
  patients: Patient[];
  patientId: string = '';
  currentPatient : Patient;
  medications_count: number;

  completelyLoaded: boolean = false;
  loadingPatient: boolean = false;
  loading: boolean = false;
  displayedColumns = ['name', 'dose', 'type', 'active', 'buttons'];

  constructor(private dialog: MatDialog,
              private medicationService: MedicationService,
              private patientsService: PatientServices,
              private usersService: UsersService) { }

  ngOnInit(): void {
    this.loadingPatient = true;

    this.patientsService.getPatients().subscribe(
      patients => {this.patients = patients}
    )
    this.load()
  }

  load() {
    this.medications=[];
    this.medications_count = 0;
    this.loading = true;
    this.usersService.getLastViewedPatient().pipe(
      tap(patientId => {
        if(!patientId) {
          this.loadingPatient=false;
          this.loading = false;
        }
    }),
      switchMap(patientId => this.patientsService.getPatientById(patientId)),
      first(),
      tap(patient => {
        this.patientId = patient.id;
        this.loadingPatient = false;
        this.currentPatient = patient;
      }),
      switchMap(patient => {
        return this.medicationService.getMedicationsByPatient(patient.id)
      }),
      first(),
      finalize(() => {
        this.loading = false;
        this.medications_count = this.medications.length;
      })
    )
      .subscribe(
        medications => {
          this.medications = medications;
        }
      );
  }

  changePatient(patientId: string) {
    this.usersService.changeLastViewedPatient(patientId)
      .subscribe(()=> {
        this.load()
      })
  }

  addMedication(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    this.dialog
      .open(CreateMedicationComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.load()
        }
      });
  }

  editMedication(medication: Medication): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';
    dialogConfig.maxWidth = '350px';

    dialogConfig.data = medication;

    this.dialog
      .open(EditMedicationComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if(val)
          this.load();
      });
  }

  deleteMedication(medication: Medication){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = medication;
    this.dialog
      .open(DeleteMedicationComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.load()
        }
      });
  }
}
