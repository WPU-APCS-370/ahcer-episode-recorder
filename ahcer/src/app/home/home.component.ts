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
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import { FreeDay } from '../models/freeday.enum';

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

  get NO_EPISODE_TODAY(){
    return FreeDay.NO_EPISODE_TODAY.toString();
  }

  get OFF_DAY(){
    return FreeDay.OFF_DAY.toString();
  }

  constructor(private episodeService: EpisodeService,
    private dialog: MatDialog,
    private patientsService: PatientServices,
    public usersService: UsersService) {

  }

  ngOnInit(): void {
    this.loadingPatient = true;
    if (this.usersService.isAdmin) {
      this.records$ = this.patientsService.getAllRecords();
      this.records$.subscribe(records => {
        this.patients = records
      });
      this.getLastViewd()

    } else {

      this.patientsService.getPatients().subscribe(
        patients => {
          this.patients = patients
        }
      )
      this.getLastViewd()
    }


  }

  freeday(day: FreeDay): void {
    const currentDate = Timestamp.fromDate(new Date());
    const freeday: any = {
      status: day,
      startTime: currentDate,
      endTime: currentDate
    };

    this.episodeService.getAllEpisodesByPatient(this.currentPatient.id,'desc').subscribe({
      next: (episodes: any[]) => {
        const dayExists = episodes.some(episode => {
          const episodeDate = episode.startTime.toDate();
          const currentDayDate = currentDate.toDate();

          return episode.status == day && episodeDate.getDate() == currentDayDate.getDate();
        });

        if (dayExists) {
          alert(`${day} has already been added.`);
        } else {
          this.episodeService.createEpisode(this.currentPatient.id, freeday).subscribe({
            next: () => {
              console.log(`${day} added successfully`);
              this.loadEpisodes(this.currentPatient.id,this.currentPatient.userId);
            },
            error: (err) => {
              console.error('Error creating freeday:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading episodes:', err);
      }
    });
  }

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
