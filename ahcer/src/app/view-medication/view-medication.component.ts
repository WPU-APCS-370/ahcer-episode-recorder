import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { PatientServices } from "../services/patient.service";
import { UsersService } from "../services/users.service";
import { finalize, first, last, switchMap, tap } from "rxjs";
import { Medication } from "../models/medication";
import { MedicationService } from "../services/medication.service";
import { Patient } from "../models/patient";
import { CreateMedicationComponent } from "../create-medication/create-medication.component";
import { DeleteMedicationComponent } from "../delete-medication/delete-medication.component";
import { EditMedicationComponent } from "../edit-medication/edit-medication.component";
import { user } from 'rxfire/auth';

@Component({
  selector: 'app-view-medication',
  templateUrl: './view-medication.component.html',
  styleUrls: ['./view-medication.component.scss']
})
export class ViewMedicationComponent implements OnInit {

  medications: Medication[];
  patients: Patient[];
  patientId: string = '';
  userId:string
  currentPatient: Patient;
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

    if (this.usersService.isAdmin) {
      this.patientsService.getAllRecords().subscribe(
        patients => {
          this.patients = patients
          console.log(patients);

          // this.loadForAdmin(patients)
        }
      )
    } else {
      this.patientsService.getPatients().subscribe(
        patients => { this.patients = patients }
      )
    }
    this.load()
  }

  // loadForAdmin(patients: any[]) {
  //   if (!patients || patients.length === 0) {
  //     console.error("No patients provided");
  //     return;
  //   }

  //   this.currentPatient = patients[0]
  //   const patientId = patients[0].id;
  //   const userId = patients[0].userId;

  //   this.medications = [];
  //   this.medications_count = 0;

  //   this.loadMedications(patientId, userId);
  // }

  // loadMedications(patientId: string, userId: string) {
  //   this.medications = [];
  //   this.medications_count = 0;
  //   this.loading = true;
  //   this.loadingPatient = true;

  //   this.medicationService.getMedicationsByPatient(patientId, userId).pipe(
  //     first(),
  //     finalize(() => {
  //       this.loadingPatient = false;
  //       this.loading = false;
  //       this.medications_count = this.medications.length;
  //     })
  //   ).subscribe(
  //     medications => {
  //       this.medications = medications;
  //     },
  //     error => {
  //       console.error("Error loading medications", error);
  //       this.loadingPatient = false;
  //       this.loading = false;
  //     }
  //   );
  // }



  load() {
    this.medications = [];
    this.medications_count = 0;
    this.loading = true;

    this.usersService.getLastViewedPatient().pipe(
      tap(lastPatient => {
        if (!lastPatient) {
          this.loadingPatient = false;
          this.loading = false;
        }
        this.userId=lastPatient.lastPatientViewdUserId
        // console.log(this.userId);
      }),
      switchMap(lastPatient => this.patientsService.getPatientById(lastPatient.lastPatientViewed,lastPatient.lastPatientViewdUserId)),
      first(),
      tap(patient => {
        // console.log(patient);

        this.patientId = patient.id;
        this.loadingPatient = false;
        this.currentPatient = patient;
      }),
      switchMap(patient => {

        return this.medicationService.getMedicationsByPatient(patient.id,this.userId)
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

  changePatient(patient: any) {

    const patientId = patient.id
    const userId = patient.userId
    this.usersService.changeLastViewedPatient(patientId, userId)
      .subscribe(() => {
        this.load()
        // if (this.usersService.isAdmin) {
        //   this.currentPatient = patient
        //   this.loadMedications(patientId, userId)
        // } else {
        //   this.load()
        // }
      })
  }

  addMedication(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';

    this.dialog
      .open(CreateMedicationComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        this.load()
        // if (val) {
        //   if (this.usersService.isAdmin){
        //     this.loadForAdmin(this.patients)
        //   }else{
        //     this.load()
        //   }
        // }
      });
  }

  editMedication(medication: Medication): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';

    dialogConfig.data = medication;

    this.dialog
      .open(EditMedicationComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val)
          this.load();
      });
  }

  deleteMedication(medication: Medication) {
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
