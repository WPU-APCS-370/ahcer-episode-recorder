import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Episode} from "../models/episode";
import {Patient} from "../models/patient";
import {EpisodeService} from "../services/episode.service";
import {PatientServices} from "../services/patient.service";
import {UsersService} from "../services/users.service";
import {finalize} from "rxjs";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import {MedicationService} from "../services/medication.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-episode-report',
  templateUrl: './episode-report.component.html',
  styleUrls: ['./episode-report.component.scss']
})
export class EpisodeReportComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['startTime', 'endTime', 'duration', 'symptoms',
                                'rescueMeds', 'prescriptionMeds', 'triggers'];
  loadingPatient: boolean = false;
  loadingEpisodes: boolean = false;
  loadingRescueMeds: boolean = false;
  episodes: Episode[]=[];
  patients: Patient[];
  rescueMedNames: Object = {};
  currentPatient : Patient;
  episodes_count: number;
  dataSource: MatTableDataSource<Episode> = new MatTableDataSource<Episode>();

  constructor(private medicationService: MedicationService,
              private episodeService: EpisodeService,
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
          this.loadPatient(patientId);
          this.loadEpisodes(patientId);
          this.loadRescueMeds(patientId);
        }
        else {
          this.loadingPatient = false;
        }
      })
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  sortingDataAccessor = (item: Episode, property: string) => {
    switch (property) {
      case 'startTime':
        return item.startTime.seconds;
      case 'endTime':
        return item.endTime?.seconds;
      case 'duration':
        return (item.endTime)? item.endTime.seconds - item.startTime.seconds: null;
      case 'symptoms':
        return this.displaySymptomsString(item.symptoms);
      default:
        return item[property];
    }
  }

  reloadDataSource() {
    this.dataSource.data = this.episodes;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.reloadDataSource();
  }

  loadEpisodes(patientId: string) {
    this.loadingEpisodes = true;
    this.episodeService.getAllEpisodesByPatient(patientId, 'desc')
      .pipe(
        finalize(() => {
          this.loadingEpisodes = false;
          this.episodes_count = this.episodes.length;
          this.reloadDataSource();
        })
      )
      .subscribe(
        episodes => {this.episodes = episodes}
      );
  }

  changePatient(patientId: string) {
    this.usersService.changeLastViewedPatient(patientId)
      .subscribe(()=> {
        this.loadPatient(patientId)
      })
  }

  loadPatient(patientId: string) {
    if(patientId == this.currentPatient?.id) {
      return
    }
    this.patientsService.getPatientById(patientId)
      .pipe(
        finalize(()=> this.loadingPatient = false)
      )
      .subscribe(patient => {
        this.currentPatient = patient;
        this.loadEpisodes(patientId);
        this.loadRescueMeds(patientId);
      })
  }

  loadRescueMeds(patientId: string) {
    this.loadingRescueMeds = true;
    this.medicationService.getMedicationsByType(patientId, true,  false, false)
      .pipe(
        finalize(()=> this.loadingRescueMeds=false)
      ).subscribe(medications => {
        for(let med of medications) {
          this.rescueMedNames[med.id] = med.name;
        }
      })
  }

  calculateDuration(startTime: Timestamp, endTime: Timestamp) {
    return this.episodeService.calculateDuration(startTime, endTime);
  }

  //needs rework when symptom management is implemented
  displaySymptomsString(symptoms: Episode["symptoms"], showFullList: boolean = false): string {
    if (!symptoms) {
      return "";
    }
    let symptomTexts = ["Full Body", "Left Arm", "Right Arm", "Left Leg", "Right Leg",
      "Left Hand", "Right Hand", "Eyes", "Loss of Consciousness", "Seizure"];
    let symptomKeys = ["fullBody", "leftArm", "rightArm", "leftLeg", "rightLeg",
      "leftHand", "rightHand", "eyes", "lossOfConsciousness", "seizure"];
    let symptomStr = "";
    let numSymptoms = 0;
    for (let index in symptomKeys) {
      let symptomText = ""
      if(symptoms[symptomKeys[index]]) {
        if(!showFullList && numSymptoms == 2) {
          symptomStr +=", ...";
          break;
        }

        if(symptomKeys[index]=="lossOfConsciousness" || symptomKeys[index]=="seizure") {
          symptomText = symptomTexts[index];
        }
        else {
          symptomText = symptomTexts[index];
          symptomText += ` (${symptoms[symptomKeys[index]]})`;
        }

        if(numSymptoms == 0) {
          symptomStr = symptomText;
        }
        else if(numSymptoms > 0) {
          symptomStr += `, ${symptomText}`;
        }
        numSymptoms++;
      }
    }
    return symptomStr;
  }

  //needs rework when timestamp for rescue meds is implemented
  displayRescueMedsString(rescueMeds: Episode["medications"]["rescueMeds"],
                          showFullList: boolean = false): string {
    if(!rescueMeds || rescueMeds.length<=0) {
      return "";
    }

    let numMeds = 0;
    let medsStr = "";
    for(let med of rescueMeds) {
      if (!showFullList && numMeds >= 2) {
        medsStr += ", ...";
        break;
      }
      if(numMeds == 0) {
        medsStr = this.rescueMedNames[med.id];
      }
      else {
        medsStr += `, ${this.rescueMedNames[med.id]}`;
      }
      numMeds++;
    }
    return medsStr;
  }

  displayPrescriptionMedsString(prescriptionMeds: Episode['medications']['prescriptionMeds'],
                                showFullList: boolean = false): string {
    if(!prescriptionMeds || prescriptionMeds.length <= 0) {
      return "";
    }

    let numMeds = 0;
    let medsStr = "";
    for(let med of prescriptionMeds) {
      if (!showFullList && numMeds >= 2) {
        medsStr += ", ...";
        break;
      }
      if(numMeds == 0) {
        medsStr = med.name;
      }
      else {
        medsStr += `, ${med.name}`;
      }
      numMeds++;
    }
    return medsStr;
  }

  displayTriggersString(triggers: Episode['knownTriggers'],
                        additionalTriggers: Episode['otherTrigger'],
                        showFullList: boolean = false): string {
    if(!(triggers || additionalTriggers) || triggers.length <= 0 || triggers[0]=='') {
      return "";
    }

    let numTriggers = 0;
    let triggersStr = "";
    for (let trigger of triggers) {
      if (!showFullList && numTriggers >= 2) {
        numTriggers ++;
        triggersStr += ", ...";
        break;
      }
      if (numTriggers == 0)
        triggersStr = trigger;
      else
        triggersStr += `, ${trigger}`;
      numTriggers++;
    }
    if(additionalTriggers) {
      if(showFullList)
        triggersStr += `, ${additionalTriggers}`;
      else if (numTriggers == 2) {
        triggersStr += ", ...";
      }
      else if (numTriggers < 2) {
        let words = additionalTriggers.split(" ");
        triggersStr +=","
        for (let index = 0; index<words.length; index++) {
          if(index > 1) {
            triggersStr +=" ..."
            break;
          }
          triggersStr += ` ${words[index]}`
        }
      }
    }
    return triggersStr;
  }
}

