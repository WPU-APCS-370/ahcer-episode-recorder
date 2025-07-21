import { Component, OnInit } from '@angular/core';
import { PatientServices } from '../services/patient.service';
import { Study, StudyService } from '../services/study.service';
import { StudyFormComponent } from './components/study-form/study-form.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../services/users.service';
import { DeleteConfirmationComponent } from './components/delete-confirmation/delete-confirmation.component';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  token: any;
  message = '';
  studies: Study[] = [];
  user
  constructor(
    public usersService: UsersService,
    private patientsService: PatientServices,
    private studyService: StudyService,
    private dialog: MatDialog
  ) {
  }
  ngOnInit(): void {
    this.allowToken();
    this.getStudies()
  }
  getStudies(): void {
    this.usersService.currentUser$.subscribe(u => {
      this.user = u
      this.studyService.getStudies().subscribe(data => {
        this.studies = data.map(study => ({
          ...study,
          startDate: (study.startDate as any)?.toDate?.() || study.startDate,
          endDate: (study.endDate as any)?.toDate?.() || study.endDate,
          study: this.user.study == study.id ? this.user.study : null
        }));
      });

    });

  }

  allowToken(): void {
    this.patientsService.getFCMToken().subscribe(
      (token) => {
        if (token) {
          this.token = token;
          localStorage.setItem('fcmToken', token);
          this.message = 'Notifications are enabled';
        }
        else {
          this.message = 'Please allow notifications from your settings.'
        }
      },
      (error) => {
        console.error('Unable to get permission to notify.', error);
        // this.message = 'Please try again.';
      }
    );
  }
  openModal(study?: Study): void {
    const dialogRef = this.dialog.open(StudyFormComponent, {
      width: '400px',
      data: { study }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (study && study.id) {
          this.studyService.updateStudy(study.id, result);
        } else {
          this.studyService.addStudy(result);
        }
      }
    });
  }

  deleteStudy(data: any) {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      width: '400px',
      data: { name: data.name, title: 'Study' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.studyService.updateStudy(data.id,{isDeleted: true}).then(() => {
          console.log('Study deleted');
        });
      }
    });
  }
  updateUserStudy(study: string): void {
    this.studyService.updateUserStudy(study, this.user.id).then(() => {
      this.getStudies()
    }).catch(error => {
      console.error('Error updating user study:', error);
    });
  }
}
