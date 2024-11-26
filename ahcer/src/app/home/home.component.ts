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
import { EditEpisodeFreeDayComponent } from '../edit-episode-free-day/edit-episode-free-day.component';
import { Router } from '@angular/router';
import { comparTwoDates } from '../services/data-utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['startTime', 'endTime', 'status', 'id'];
  loading: boolean = false;
  loadingPatient: boolean = false;
  episodes: Episode[];
  patients: Patient[];
  currentPatient: Patient;
  episodes_count: number;
  records$: Observable<any[]>;
  isAdd:boolean=false
  day:string=''
  notes:string=''
  timer: string = '00:00:00';
  private timerInterval: any;
  get NO_EPISODE_TODAY(){
    return FreeDay.NO_EPISODE_TODAY.toString();
  }

  get OFF_DAY(){
    return FreeDay.OFF_DAY.toString();
  }

  constructor(private episodeService: EpisodeService,
    private dialog: MatDialog,
    private patientsService: PatientServices,
    public usersService: UsersService,
    private router: Router,) {

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
  startTimer(): void {
    const startDate = this.currentPatient.startEpisode.toDate();
    this.timerInterval = setInterval(() => {
      const currentTime = new Date();
      const elapsedTime = currentTime.getTime() - startDate.getTime();

      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

      this.timer = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }, 1000);
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  freeDay(day: FreeDay){
    if(this.day==day){
      this.isAdd = !this.isAdd
    }
     this.day = day
  }

   createFreeDay(){
    const currentDate = Timestamp.fromDate(new Date());
    const freeday: any = {
      status: this.day,
      notes:this.notes,
      startTime: currentDate,
      endTime: currentDate
    };

    this.episodeService.getAllEpisodesByPatient(this.currentPatient.id,'desc').subscribe({
      next: (episodes: any[]) => {
        const dayExists = episodes.some(episode => {
          return episode.startTime && episode.status == this.day ? comparTwoDates(episode.startTime,currentDate) : false;
        });

        if (dayExists) {
          alert(`${this.day} has already been added.`);
          this.isAdd = false
          this.day = ''
          this.notes = ''
        } else {
          this.episodeService.createEpisode(this.currentPatient.id, freeday).subscribe({
            next: () => {
              console.log(`${this.day} added successfully`);
              this.loadEpisodes(this.currentPatient.id,this.currentPatient.userId);
              this.isAdd = false
              this.day = ''
              this.notes = ''
            },
            error: (err) => {
              console.error('Error creating free day:', err);
              this.isAdd = false
              this.day = ''
              this.notes = ''
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading episodes:', err);
        this.isAdd = false
        this.day = ''
        this.notes = ''
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

  editEpisode(episode: Episode): void{
    if (episode.status === 'Recorded'){
      this.editEpisodes(episode)
    }else{
      this.editEpisodeFreeDay(episode)
    }
  }
  editEpisodeFreeDay(episode: Episode): void{
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '350px';
    let uid = this.usersService.isAdmin ? this.currentPatient.userId : null;
    dialogConfig.data = [episode, this.currentPatient.id, uid];

    this.dialog
      .open(EditEpisodeFreeDayComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val)
          this.loadEpisodes(this.currentPatient.id, this.currentPatient.userId)
      });
  }

  editEpisodes(episode: Episode): void {
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
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
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
        if (this.currentPatient?.startEpisode) {
          this.startTimer();
        }
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
  startEpisode(){
    let changes = this.currentPatient
    if (!changes.userId) {
      delete changes.userId;
    }
    if(changes.startEpisode==null){
      changes.startEpisode = Timestamp.fromDate(new Date());
    }else{
      var startDate = changes.startEpisode.toDate().toISOString()
      changes.startEpisode = null
    }
    if (this.currentPatient?.startEpisode) {
      this.startTimer();
    }
    this.patientsService.updatePatient(this.currentPatient.id, changes, this.currentPatient.userId).subscribe(() => {
      // this.loadPatient(this.currentPatient.id, this.currentPatient.userId)
      if (!this.currentPatient?.startEpisode) {
        this.router.navigate(['/record-episode'], {
          queryParams: { date: startDate }
        });
      }
    });

  }
}
