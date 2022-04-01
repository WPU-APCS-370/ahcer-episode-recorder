import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PatientServices} from "../services/patient.service";
import {UsersService} from "../services/users.service";
import {finalize, first, switchMap, tap} from "rxjs";
import {Medication} from "../models/medication";
import {MedicationService} from "../services/medication.service";
import {Patient} from "../models/patient";

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
}
