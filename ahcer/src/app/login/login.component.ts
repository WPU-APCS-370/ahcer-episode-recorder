import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Platform } from '@angular/cdk/platform';
import { FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { StudyService } from '../services/study.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public signInClicked: boolean = false;
  public signInError: string = '';
  study:string = '';
  constructor(
    private afAuth: AngularFireAuth,
    public platform: Platform,
    private router: Router,
    private db: AngularFirestore,
    private fb: FormBuilder,
    private studyService: StudyService,
    public userService: UsersService
  ) { }

  ngOnInit(): void {
    this.studyService.getStudiesForToday().subscribe(data => {
      this.study = data && data.length > 0 ? data[0]?.id : '';
    });
  }

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });


  emailLogin() {
    const val = this.userForm.getRawValue();

    this.userService.loginWithEmail(val.email, val.password).then((res) => {
      this.userService.onLoginSuccessful(this.study);
    }).catch((error) => {
      this.signInError = error;
      setTimeout(() => {
        this.signInError = '';
      }, 5000);
      console.log(error);
    })
  }

  toggleEmailClicked() {
    this.signInClicked = !this.signInClicked
  }

  passwordReset(){
   let  {email}=this.userForm.value
   if (email) {
     this.userService.passwordRest(email).then((res) => {
      alert('Check Email and reset password')
     }).catch((error) => {
       this.signInError = error;
       setTimeout(() => {
         this.signInError = '';
       }, 5000);
       console.log(error);
     })

   }
  }
  loginWithGmail(){
    this.userService.onLoginSuccessful(this.study)
  }
}
