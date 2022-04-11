import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {User} from "../models/user";
import {UsersService} from "../services/users.service";
import {Patient} from "../models/patient";
import {PatientServices} from "../services/patient.service";

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {
  private userId: string = this.route.snapshot.paramMap.get('userId');
  user$: Observable<User>
  patients$: Observable<Patient[]>
  constructor(private route: ActivatedRoute,
              private usersService: UsersService,
              private patientService: PatientServices) {
    console.log(this.userId);
    this.user$ = this.usersService.getUserById(this.userId);
  }

  ngOnInit(): void {
    this.patients$ = this.patientService.getPatients(this.userId)
  }

  logout() {
    this.usersService.logout();
  }
}
