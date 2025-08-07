import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { first, Observable } from "rxjs";
import { User } from "../models/user";
import { UsersService } from "../services/users.service";
import { Patient } from "../models/patient";
import { PatientServices } from "../services/patient.service";
import { MatDialog } from '@angular/material/dialog';
import { UpdateModalComponent } from './update-modal/update-modal.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {
  private userId: string;
  user$: Observable<User>;
  patients$: Observable<Patient[]>;
  resetError: string
  chalidUserId: string
  user: any;
  constructor(private route: ActivatedRoute,
    private usersService: UsersService,
    private patientService: PatientServices,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.data.userId;
    this.user$ = this.usersService.getUserById(this.userId);
    this.patients$ = this.patientService.getPatients();
    this.user$.subscribe(u => {
      this.user = u;
    });

  }

  async logout() {
    this.usersService.logout();
  }
  async passwordReset() {
    this.user$.pipe(first()).subscribe(user => {
      this.usersService.passwordRest(user?.email).then((res) => {
        alert('To reset password email has been sent.')
        this.logout()
      }).catch((error) => {
        this.resetError = error;
        setTimeout(() => {
          this.resetError = '';
        }, 5000);
        console.log(error);
      })
    });

  }
  // deleteAcount(){
  //   this.usersService.deleteUser(this.userId)
  // }
  openModal(user?: any): void {
    const dialogRef = this.dialog.open(UpdateModalComponent, {
      width: '400px',
      data: user?.username
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.usersService.updateUser({ username: result }, this.userId)
        } catch (error) {
          console.error('Error saving study and updating users:', error);
        }
      }
    });

  }
}
