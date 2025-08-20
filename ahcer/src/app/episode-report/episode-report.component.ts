import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Episode } from "../models/episode";
import { Patient } from "../models/patient";
import { EpisodeService } from "../services/episode.service";
import { PatientServices } from "../services/patient.service";
import { UsersService } from "../services/users.service";
import { forkJoin, of, finalize, catchError, Subject } from "rxjs";
import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
import { MedicationService } from "../services/medication.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { AngularCsv } from "angular-csv-ext/dist/Angular-csv";
import { MatTooltip } from "@angular/material/tooltip";
import { debounceTime } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-episode-report',
  templateUrl: './episode-report.component.html',
  styleUrls: ['./episode-report.component.scss']
})
export class EpisodeReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private patientSelection$ = new Subject<any[]>();
  displayedColumns: string[] = ['patientName', 'startTime', 'endTime', 'status', 'duration', 'symptoms',
    'rescueMeds', 'prescriptionMeds', 'triggers', 'behavior'];
  loadingPatient: boolean = false;
  loadingEpisodes: boolean = false;
  loadingRescueMeds: boolean = false;
  episodes: Episode[] = [];
  patients: Patient[];
  rescueMedNames: Object = {};
  currentPatient: Patient;
  episodes_count: number;
  dataSource: MatTableDataSource<Episode> = new MatTableDataSource<Episode>();
  filters: Object = {};
  filterChipData: { key: string, label: string }[] = [];
  loadedPatientsData: Patient[] = [];
  loadedPatientIds: string[] = [];

  constructor(private medicationService: MedicationService,
    private episodeService: EpisodeService,
    private patientsService: PatientServices,
    private usersService: UsersService) { }

  ngOnInit(): void {
    this.loadingPatient = true;

    if (this.usersService.isAdmin) {
      this.patientsService.getAllRecords().subscribe(
        patients => {
          this.patients = patients
          // this.loadForAdmin(patients)
          this.loadingPatient = false
      this.load()

        }
      )

    } else if (this.usersService.piUser) {
      this.patientsService.getAllRecords(this.usersService.piUser).subscribe(
        patients => {
          this.patients = patients
          // this.loadForAdmin(patients)
          this.loadingPatient = false
      this.load()

        })
    }
    else {
      this.patientsService.getPatients().subscribe(
        patients => { this.patients = patients })
      this.loadingPatient = false
      this.load()
    }
    this.patientSelection$
      .pipe(debounceTime(1200)) // Adjust the debounce delay as needed
      .subscribe(selectedPatients => {
        this.changePatient(selectedPatients);
      });

  }

  load() {
    this.usersService.getLastViewedPatient().subscribe(
      (lastPatient) => {
        if (lastPatient) {
          const selectedPatient = this.patients?.find(
            p =>
              p.id === lastPatient.lastPatientViewed &&
              p.userId === lastPatient.lastPatientViewdUserId
          );
          if (selectedPatient) {
            // Since mat-select multiple expects an array
            this.patientSelection$.next([selectedPatient]);
          }
          // this.loadPatient(lastPatient.lastPatientViewed, lastPatient.lastPatientViewdUserId);
          // this.loadEpisodes(lastPatient.lastPatientViewed, lastPatient.lastPatientViewdUserId);
          // this.loadRescueMeds(lastPatient.lastPatientViewed, lastPatient.lastPatientViewdUserId);
        }
        else {
          this.loadingPatient = false;
        }
      })
  }



  sortingDataAccessor = (item: Episode, property: string) => {
    switch (property) {
      case 'startTime':
        return item.startTime.seconds;
      case 'endTime':
        return item.endTime?.seconds;
      case 'duration':
        return (item.endTime) ? item.endTime.seconds - item.startTime.seconds : null;
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
        if (key == "startTime" || key == "endTime") {
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
  onBeforePrint() {
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

  onPatientSelectionChange(patients: any[]) {
    this.patientSelection$.next(patients);
  }

  changePatient(patients: any[]) {
    this.episodes = [];
    this.episodes_count = 0;
    this.rescueMedNames = {}; // optional reset
    this.loadedPatientsData = patients;

    this.loadingEpisodes = true;
    this.loadingRescueMeds = true;

    const episodesObservables = patients.map(patient =>
      this.episodeService.getAllEpisodesByPatient(patient.id, 'desc', patient.userId).pipe(
        catchError(error => {
          console.error(`Episodes load failed for patient ${patient.id}`, error);
          return of([]);
        })
      )
    );

    const rescueMedsObservables = patients.map(patient =>
      this.medicationService.getMedicationsByType(patient.id, true, false, false, patient.userId).pipe(
        catchError(error => {
          console.error(`Rescue meds load failed for patient ${patient.id}`, error);
          return of([]);
        })
      )
    );

    forkJoin([...episodesObservables, ...rescueMedsObservables])
  .pipe(
    finalize(() => {
      this.loadingEpisodes = false;
      this.loadingRescueMeds = false;
    })
  )
  .subscribe(results => {
    const episodesResults = results.slice(0, patients.length);
    const rescueMedsResults = results.slice(patients.length);

    let  allEpisodes = []; // Clear before appending

    episodesResults.forEach((episodes, index) => {
      const patient = patients[index];
      const taggedEpisodes = episodes.map(ep => ({
        ...ep,
        patientId: patient.id,
        patientName: this.getPatientName(patient.id) || 'Unknown'
      }));
       allEpisodes = [...allEpisodes, ...taggedEpisodes];
    });
    this.episodes = allEpisodes;
    // Update rescue meds
    rescueMedsResults.forEach(medications => {
      for (let med of medications) {
        this.rescueMedNames[med.id] = med.name;
      }
    });

    this.episodes_count = this.episodes.length;
    this.reloadDataSource();
  });

  }



  loadEpisodes(patientId: string, userId?: string) {
    this.loadingEpisodes = true;
    this.episodeService.getAllEpisodesByPatient(patientId, 'desc', userId)
      .pipe(
        finalize(() => {
          this.loadingEpisodes = false;
          this.episodes_count = this.episodes.length;
          this.reloadDataSource();
        })
      )
      .subscribe(episodes => {

        const taggedEpisodes = episodes.map(ep => ({
          ...ep,
          patientId,
          patientName: this.getPatientName(patientId) || 'Unknown'
        }));

        this.episodes = [...this.episodes, ...taggedEpisodes];
      });

  }

  loadRescueMeds(patientId: string, userId?: string) {
    this.loadingRescueMeds = true;
    this.medicationService.getMedicationsByType(patientId, true, false, false, userId)
      .pipe(
        finalize(() => this.loadingRescueMeds = false)
      ).subscribe(medications => {
        for (let med of medications) {
          this.rescueMedNames[med.id] = med.name;
        }
      })
  }

  getPatientName(id: string): string {
    const selected = this.loadedPatientsData.find(p => p.id === id);
    return selected?.firstName || 'Unknown';
  }



  loadPatient(patientId: string, userId?: string) {
    if (patientId == this.currentPatient?.id) {
      return
    }
    this.patientsService.getPatientById(patientId, userId)
      .pipe(
        finalize(() => this.loadingPatient = false)
      )
      .subscribe(patient => {
        this.loadedPatientsData.push(patient)
        this.patientSelection$.next(this.loadedPatientsData);
        // this.currentPatient = patient;
        // this.loadedPatientsData.push(patient);
        // this.loadEpisodes(patientId, userId);
        // this.loadRescueMeds(patientId, userId);
        // this.loadedPatientIds.push(patientId);
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
      "Left Hand", "Right Hand", "Eyes", "Reduced Consciousness", "Seizure",
      "Apnea/Breathing", "Autonomic Dysfunction", "Swallowing/Choking", "Chorea/Tremors"];
    let symptomKeys = ["fullBody", "leftArm", "rightArm", "leftLeg", "rightLeg",
      "leftHand", "rightHand", "eyes", "lossOfConsciousness", "seizure",
      "apnea_breathing", "autonomic_dysfunction", "swallowing_choking", "chorea_tremors"];
    let symptomStr = "";
    let numSymptoms = 0;
    for (let index in symptomKeys) {
      let symptomText = "";
      let symptom = symptoms[symptomKeys[index]];
      if (symptom?.type || symptom?.present) {
        if (!showFullList && numSymptoms == 2) {
          symptomStr += ", ...";
          break;
        }

        if (symptomKeys[index] == "lossOfConsciousness" || symptomKeys[index] == "seizure") {
          symptomText = symptomTexts[index];
        }
        else {
          symptomText = symptomTexts[index];
          symptomText += ` (${symptom.type})`;
        }

        if (numSymptoms == 0) {
          symptomStr = symptomText;
        }
        else if (numSymptoms > 0) {
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
    if (!rescueMeds || rescueMeds.length <= 0) {
      return "";
    }

    let numMeds = 0;
    let medsStr = "";
    for (let med of rescueMeds) {
      if (!showFullList && numMeds >= 2) {
        medsStr += ", ...";
        break;
      }
      if (numMeds == 0) {
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
    if (!prescriptionMeds || prescriptionMeds.length <= 0) {
      return "";
    }

    let numMeds = 0;
    let medsStr = "";
    for (let med of prescriptionMeds) {
      if (!showFullList && numMeds >= 2) {
        medsStr += ", ...";
        break;
      }
      if (numMeds == 0) {
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
    if (!(triggers || additionalTriggers) || triggers.length <= 0 || triggers[0] == '') {
      return "";
    }

    let numTriggers = 0;
    let triggersStr = "";
    for (let trigger of triggers) {
      if (!showFullList && numTriggers >= 2) {
        numTriggers++;
        triggersStr += ", ...";
        break;
      }
      if (numTriggers == 0)
        triggersStr = trigger;
      else
        triggersStr += `, ${trigger}`;
      numTriggers++;
    }
    if (additionalTriggers) {
      if (showFullList)
        triggersStr += `, ${additionalTriggers}`;
      else if (numTriggers == 2) {
        triggersStr += ", ...";
      }
      else if (numTriggers < 2) {
        let words = additionalTriggers.split(" ");
        triggersStr += ","
        for (let index = 0; index < words.length; index++) {
          if (index > 1) {
            triggersStr += " ..."
            break;
          }
          triggersStr += ` ${words[index]}`
        }
      }
    }
    return triggersStr;
  }

  tooltipOnClick(tooltip: MatTooltip) {
    if (tooltip._isTooltipVisible()) {
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
      let label = '';
      if (key == 'startTime' || key == 'endTime') {
        label = (key == 'startTime') ? 'Start time ' : 'End time  ';
        if (!filters[key].start) {
          if (!filters[key].end) {
            continue;
          }
          else {
            label += 'earlier than or on ' + (new Date(filters[key].end)).toLocaleDateString();
          }
        }
        else {
          let rangeStartDate = (new Date(filters[key].start)).toLocaleDateString();
          if (!filters[key].end) {
            label += 'later than or on ' + rangeStartDate;
          }
          else {
            let rangeEndDate = (new Date(filters[key].end)).toLocaleDateString();
            if (rangeStartDate === rangeEndDate)
              label += 'on ' + rangeEndDate;
            else
              label += 'between ' + rangeStartDate + ' and ' + rangeEndDate;
          }
        }
      }
      this.filterChipData.push({ key, label });
    }
    this.dataSource.filter = JSON.stringify(filters);
    this.dataSource.paginator = this.paginator;
  }

  removeChip(index: number, keyStr: string) {
    this.filterChipData.splice(index, 1);
    let key: keyof Object = keyStr as keyof Object;
    let { [key]: value, ...filters } = this.filters;
    this.filters = filters;
    this.dataSource.filter = JSON.stringify(filters);
    this.dataSource.paginator = this.paginator;
  }

  // exportToCSV() {
  //   let data = [];

  //   for (let index = 0; index < this.episodes.length; index++) {
  //     let episode = this.episodes[index];
  //     let episodeData = {};
  //     episodeData['startTime'] = episode.startTime.toDate().toLocaleString();
  //     episodeData['endTime'] = (episode.endTime) ? episode.endTime.toDate().toLocaleString() : null;
  //     episodeData['status'] = episode.status
  //     episodeData['duration'] = this.episodeService.calculateDuration(episode.startTime, episode.endTime);
  //     let symptoms = this.displaySymptomsString(episode.symptoms, true);
  //     episodeData['symptoms'] = symptoms ? symptoms : null;
  //     let rescueMeds = this.displayRescueMedsString(episode.medications?.rescueMeds, true);
  //     episodeData['rescueMeds'] = rescueMeds ? rescueMeds : null;
  //     let prescriptionMeds = this.displayPrescriptionMedsString(
  //       episode.medications?.prescriptionMeds, true
  //     );
  //     episodeData['prescriptionMeds'] = prescriptionMeds ? prescriptionMeds : null;
  //     let triggers = this.displayTriggersString(episode.knownTriggers, episode.otherTrigger, true);
  //     episodeData['triggers'] = triggers ? triggers : null;
  //     episodeData['behavior'] = episode.behavior ? episode.behavior : null;
  //     data.push(episodeData);
  //   }
  //   let headers = ['Start Time', 'End Time', 'Status', 'Duration', 'Symptoms',
  //     'Rescue Medications', 'Prescription Medications', 'Triggers', 'Behavior'];
  //   new AngularCsv(data,
  //     "Complete-Episode-List",
  //     {
  //       showLabels: true,
  //       nullToEmptyString: true,
  //       headers
  //     });
  // }



exportToExcel() {
  const groupedEpisodes = this.groupEpisodesByPatient();
  const workbook = XLSX.utils.book_new();

  for (const patientId in groupedEpisodes) {
    const patientEpisodes = groupedEpisodes[patientId];
    const patientName = patientEpisodes[0].patientName || 'Unknown';

    const data = patientEpisodes.map(episode => ({
      'Start Time': episode.startTime.toDate().toLocaleString(),
      'End Time': episode.endTime ? episode.endTime.toDate().toLocaleString() : '',
      'Status': episode.status,
      'Duration': this.episodeService.calculateDuration(episode.startTime, episode.endTime),
      'Symptoms': this.displaySymptomsString(episode.symptoms, true) || '',
      'Rescue Medications': this.displayRescueMedsString(episode.medications?.rescueMeds, true) || '',
      'Prescription Medications': this.displayPrescriptionMedsString(episode.medications?.prescriptionMeds, true) || '',
      'Triggers': this.displayTriggersString(episode.knownTriggers, episode.otherTrigger, true) || '',
      'Behavior': episode.behavior || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const sheetName = patientName.length > 31 ? patientName.substring(0, 31) : patientName; // Excel limit
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, 'Complete-Episode-List.xlsx');
}

private groupEpisodesByPatient() {
  const grouped = {};
  for (let ep of this.episodes as any) {
    if (!grouped[ep.patientId]) {
      grouped[ep.patientId] = [];
    }
    grouped[ep.patientId].push(ep);
  }
  return grouped;
}

}

