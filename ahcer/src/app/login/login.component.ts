import { Component, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public signInClicked: boolean = false;
  public signInError: string = '';
  constructor(
    public platform: Platform,
    private fb: FormBuilder,
    public userService: UsersService
  ) { }

  ngOnInit(): void {
  }

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });


  emailLogin() {
    const val = this.userForm.getRawValue();

    this.userService.loginWithEmail(val.email, val.password).then((res) => {
      this.userService.onLoginSuccessful();
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
    this.userService.onLoginSuccessful()
  }
}
