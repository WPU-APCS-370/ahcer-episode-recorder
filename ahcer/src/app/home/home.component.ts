import { Component, OnInit } from '@angular/core';
import { EpisodeService } from "../services/episode.service";
import { finalize, Observable } from "rxjs";
import { Episode } from "../models/episode";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ViewEpisodeComponent } from "../view-episode/view-episode.component";
import { Patient } from "../models/patient";
import { EditEpisodeComponent } from "../edit-episode/edit-episode.component";
import { PatientServices } from "../services/patient.service";
import { UsersService } from "../services/users.service";
import { DeleteEpisodeComponent } from "../delete-episode/delete-episode.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['startTime', 'endTime', 'id'];
  loading: boolean = false;
  loadingPatient: boolean = false;
  episodes: Episode[];
  patients: Patient[];
  currentPatient: Patient;
  episodes_count: number;
  records$: Observable<any[]>;


  constructor(private episodeService: EpisodeService,
    private dialog: MatDialog,
    private patientsService: PatientServices,
    private usersService: UsersService) {

  }

  ngOnInit(): void {
    this.loadingPatient = true;
    if (this.usersService.isAdmin) {
      this.records$ = this.patientsService.getAllRecords();
      this.records$.subscribe(records => {
        console.log('All records:', records);
        this.patients = records
      });
      this.getLastViewd()

    } else {

      this.patientsService.getPatients().subscribe(
        patients => {
          console.log(patients);
          this.patients = patients
        }
      )
      this.getLastViewd()
    }



  }

  // getLastViewdAdmin(patients: any) {
  //   let patientId = patients[0].id
  //   let userId = patients[0].userId
  //   if (patientId) {
  //     this.loading = true;
  //     this.loadPatient(patientId, userId);
  //     this.loadEpisodes(patientId, userId);
  //   } else {
  //     this.loadingPatient = false;
  //   }
  // }


  getLastViewd() {
    this.usersService.getLastViewedPatient().subscribe(
      (lastPatient) => {
        if (lastPatient) {
          this.loading = true;
          this.loadPatient(lastPatient.lastPatientViewed,lastPatient.lastPatientViewdUserId);
          this.loadEpisodes(lastPatient.lastPatientViewed,lastPatient.lastPatientViewdUserId);
        }
        else {
          this.loadingPatient = false;
        }
      })
  }

  loadEpisodes(patientId: string, userId?: any) {
    this.episodeService.getLastFiveEpisodesByPatient(patientId, 'desc', userId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.episodes_count = this.episodes.length;
        })
      )
      .subscribe(
        episodes => { this.episodes = episodes }
      );
  }

  onViewDetails(episode: Episode) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';
    let uid = this.usersService.isAdmin ? this.currentPatient.userId : null;
    dialogConfig.data = [episode, this.currentPatient.id,uid];
    this.dialog
      .open(ViewEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          // this.loadPatients()
        }
      });


  }

  editEpisode(episode: Episode): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';
    let uid = this.usersService.isAdmin ? this.currentPatient.userId : null;
    dialogConfig.data = [episode, this.currentPatient.id, uid];

    this.dialog
      .open(EditEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val)
          this.loadEpisodes(this.currentPatient.id, this.currentPatient.userId)
      });
  }

  changePatient(patient: any) {
    let patientId = patient.id
    let userId = patient.userId
    this.usersService.changeLastViewedPatient(patientId, userId)

      .subscribe(() => {
        this.loadPatient(patientId, userId)
      })
  }

  loadPatient(patientId: string, userId?: string) {
    this.patientsService.getPatientById(patientId, userId)
      .pipe(
        finalize(() => this.loadingPatient = false)
      )
      .subscribe(patient => {
        this.currentPatient = patient;
        this.currentPatient.userId = userId
        console.log(this.currentPatient);

        this.loadEpisodes(patientId, userId);
      })
  }

  deleteEpisode(episode: Episode) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = [episode, this.currentPatient.id,this.currentPatient.userId];
    this.dialog
      .open(DeleteEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.loadEpisodes(this.currentPatient.id, this.currentPatient.userId)
        }
      });
  }
}
