import { Component, OnInit } from '@angular/core';
import {EpisodeService} from "../services/episode.service";
import {finalize} from "rxjs";
import {Episode} from "../models/episode";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ViewEpisodeComponent} from "../veiw-episode/view-episode.component";
import {Patient} from "../models/patient";
import {EditEpisodeComponent} from "../edit-episode/edit-episode.component";
import {PatientServices} from "../services/patient.service";
import {UsersService} from "../services/users.service";
import {DeleteEpisodeComponent} from "../delete-episode/delete-episode.component";

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
  currentPatient : Patient;
  episodes_count: number;

  constructor(private episodeService: EpisodeService,
              private dialog: MatDialog,
              private patientsService: PatientServices,
              private usersService: UsersService) { }

  ngOnInit(): void {
    this.loadingPatient = true;

    this.patientsService.getPatients().subscribe(
      patients => {this.patients = patients}
    )
    this.usersService.getLastViewedPatient().subscribe(
      (patientId)  => {
        if(patientId) {
          this.loading = true;
          this.loadPatient(patientId);
          this.loadEpisodes(patientId);
        }
        else {
          this.loadingPatient = false;
        }
      })

  }

  loadEpisodes(patientId: string) {
    this.episodeService.getLastFiveEpisodesByPatient(patientId, 'desc')
      .pipe(
        finalize(() => {
          this.loading = false;
          this.episodes_count = this.episodes.length;
        })
      )
      .subscribe(
        episodes => {this.episodes = episodes}
      );
  }

  onViewDetails(episode:Episode) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = [episode, this.currentPatient.id];
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
    dialogConfig.minWidth = '350px';
    dialogConfig.maxWidth = '350px';

    dialogConfig.data = episode;

    this.dialog
      .open(EditEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val)
          this.loadEpisodes(this.currentPatient.id)
      });
  }

  changePatient(patientId: string) {
    this.usersService.changeLastViewedPatient(patientId)
      .subscribe(()=> {
        this.loadPatient(patientId)
      })
  }

  loadPatient(patientId: string) {
    this.patientsService.getPatientById(patientId)
      .pipe(
        finalize(()=> this.loadingPatient = false)
      )
      .subscribe(patient => {
        this.currentPatient = patient;
        this.loadEpisodes(patientId);
      })
  }

  deleteEpisode(episode: Episode){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = episode;
    this.dialog
      .open(DeleteEpisodeComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.loadEpisodes(this.currentPatient.id)
        }
      });
  }
}
