import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
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
import {AngularCsv} from "angular-csv-ext/dist/Angular-csv";
import {MatTooltip} from "@angular/material/tooltip";

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
  filters: Object = {};
  filterChipData: {key: string, label: string}[] = [];

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

  filterFunction(): (data: Episode, filterStr: string) => boolean {
    return (data, filterStr) => {
      let filters = JSON.parse(filterStr);
      for (let key in filters) {
        if(key == "startTime" || key == "endTime") {
          if (Object.keys(filters[key]).length > 0) {
            let episodeStartTime = data[key]?.toDate();
            let filterStartDate: Date, filterEndDate: Date = null;
            let dataMatchesFilter = true;

            if (filters[key].start) {
              filterStartDate = new Date(filters[key].start);
              dataMatchesFilter = dataMatchesFilter && (episodeStartTime >= filterStartDate);
            }
            if (filters[key].end) {
              filterEndDate = new Date(filters[key].end);
              filterEndDate.setTime(filterEndDate.getTime() + (24 * 60 * 60 * 1000 - 1));
              dataMatchesFilter = dataMatchesFilter && (episodeStartTime <= filterEndDate);
            }
            if (!dataMatchesFilter) {
              return false;
            }
          }
        }
      }
      return true;
    }
  }

  reloadDataSource() {
    this.dataSource.data = this.episodes;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.filterFunction();
  }

  @HostListener('window:beforeprint')
  onBeforePrint(){
    this.dataSource.data = this.episodes;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.paginator = null;
  }

  @HostListener('window:afterprint')
  onAfterPrint() {
    this.reloadDataSource();
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
        episodes => {
          this.episodes = episodes;
        }
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
      "Left Hand", "Right Hand", "Eyes", "Loss of Consciousness", "Seizure", 
      "Apnea/Breathing", "Autonomic Dysfunction", "Swallowing/Choking", "Chorea/Tremors"];
    let symptomKeys = ["fullBody", "leftArm", "rightArm", "leftLeg", "rightLeg",
      "leftHand", "rightHand", "eyes", "lossOfConsciousness", "seizure",
      "apnea_breathing", "autonomic_dysfunction", "swallowing_choking", "chorea_tremors"];
    let symptomStr = "";
    let numSymptoms = 0;
    for (let index in symptomKeys) {
      let symptomText = "";
      let symptom = symptoms[symptomKeys[index]];
      if(symptom?.type || symptom?.present) {
        if(!showFullList && numSymptoms == 2) {
          symptomStr +=", ...";
          break;
        }

        if(symptomKeys[index]=="lossOfConsciousness" || symptomKeys[index]=="seizure") {
          symptomText = symptomTexts[index];
        }
        else {
          symptomText = symptomTexts[index];
          symptomText += ` (${symptom.type})`;
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

  tooltipOnClick(tooltip: MatTooltip) {
    if(tooltip._isTooltipVisible()) {
      tooltip.hide();
    }
    else {
      tooltip.show();
    }
  }

  updateFilters(filters: Object) {
    this.filters = filters;
    this.filterChipData = [];
    for (let key in filters) {
      let label ='';
      if(key == 'startTime' || key == 'endTime') {
        label = (key=='startTime')? 'Start time ' : 'End time  ';
        if(!filters[key].start) {
          if(!filters[key].end) {
            continue;
          }
          else {
            label += 'earlier than or on '+ (new Date(filters[key].end)).toLocaleDateString();
          }
        }
        else {
          let rangeStartDate = (new Date(filters[key].start)).toLocaleDateString();
          if(!filters[key].end) {
            label += 'later than or on ' + rangeStartDate;
          }
          else {
            let rangeEndDate = (new Date(filters[key].end)).toLocaleDateString();
            if(rangeStartDate === rangeEndDate)
              label += 'on ' + rangeEndDate;
            else
              label += 'between ' + rangeStartDate + ' and ' + rangeEndDate;
          }
        }
      }
      this.filterChipData.push({key, label});
    }
    this.dataSource.filter = JSON.stringify(filters);
    this.dataSource.paginator = this.paginator;
  }

  removeChip(index: number, keyStr: string) {
    this.filterChipData.splice(index, 1);
    let key: keyof Object = keyStr as keyof Object;
    let {[key]: value, ...filters} = this.filters;
    this.filters = filters;
    this.dataSource.filter = JSON.stringify(filters);
    this.dataSource.paginator = this.paginator;
  }

  exportToCSV() {
    let data = [];

    for (let index = 0; index < this.episodes.length; index++) {
      let episode = this.episodes[index];
      let episodeData = {};
      episodeData['startTime'] = episode.startTime.toDate().toLocaleString();
      episodeData['endTime'] = (episode.endTime)? episode.endTime.toDate().toLocaleString() : null;
      episodeData['duration'] = this.episodeService.calculateDuration(episode.startTime, episode.endTime);
      let symptoms = this.displaySymptomsString(episode.symptoms, true);
      episodeData['symptoms'] = symptoms? symptoms: null;
      let rescueMeds = this.displayRescueMedsString(episode.medications?.rescueMeds, true);
      episodeData['rescueMeds'] = rescueMeds? rescueMeds: null;
      let prescriptionMeds = this.displayPrescriptionMedsString(
        episode.medications?.prescriptionMeds, true
      );
      episodeData['prescriptionMeds'] = prescriptionMeds? prescriptionMeds: null;
      let triggers = this.displayTriggersString(episode.knownTriggers, episode.otherTrigger, true);
      episodeData['triggers'] = triggers? triggers : null;
      data.push(episodeData);
    }
    let headers = ['Start Time', 'End Time', 'Duration', 'Symptoms',
                   'Rescue Medications', 'Prescription Medications', 'Triggers'];
    new AngularCsv(data,
      "Complete-Episode-List",
      {
        showLabels: true,
        nullToEmptyString: true,
        headers
      });
  }
}

