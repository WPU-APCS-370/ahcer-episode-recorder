import { Component, OnInit } from '@angular/core';
import {PatientServices} from "../services/patient-services.service";
import {Observable} from "rxjs";
import {Patient} from "../models/patient";

@Component({
  selector: 'app-view-patient',
  templateUrl: './view-patient.component.html',
  styleUrls: ['./view-patient.component.scss']
})
export class ViewPatientComponent implements OnInit {

  patients: Patient[] | undefined

  constructor(private patientService: PatientServices) { }

  ngOnInit(): void {
    this.loadPatients();
  }
  loadPatients() {
    this.patientService.getPatient()
      .subscribe(
        (result) => this.patients = result
      )
  }
}
