import { Component, OnInit } from '@angular/core';
import { PatientServices } from '../services/patient.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  token:any;
  message = '';
  constructor(
    private patientsService: PatientServices) {}
    ngOnInit(): void {
    this.allowToken();
  }

  allowToken(): void {

    this.patientsService.getFCMToken().subscribe(
      (token) => {
        if (token) {
          this.token = token;
          localStorage.setItem('fcmToken', token);
          this.message = 'Notifications are enabled';
        }
        else{
          this.message = 'Please allow notifications from your settings.'
        }
      },
      (error) => {
        console.error('Unable to get permission to notify.', error);
        // this.message = 'Please try again.';
      }
    );
  }
}
