import { Component } from '@angular/core';
import {PatientServices} from "./services/patient.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ahcer';
  constructor(private patientservice: PatientServices ) {
    console.log(patientservice.getPatient());
  }
}
