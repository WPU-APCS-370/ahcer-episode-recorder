import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";
// import { Authentication, GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Observable, from } from 'rxjs';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
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
    private afAuth: AngularFireAuth,
    public platform: Platform,
    private router: Router,
    private db: AngularFirestore,
    private fb: FormBuilder,
    private userService: UsersService
  ) {}

  ngOnInit() {}

  userForm =this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onLoginSuccessful() {
    this.afAuth.app.then(cred => {
      let uid = cred.auth().currentUser.uid;
      this.db.firestore.doc(`users/${uid}`)
        .get()
        .then((doc)=> {
          const data = doc.data();
          localStorage.setItem('user', JSON.stringify(data))
          return !doc.exists ?
            this.db.collection(`users`).doc(uid).set({}) :
            null;
        });
    });
    this.router.navigateByUrl('/')
  }


  emailLogin(){
    const val = this.userForm.getRawValue();

    this.userService.loginWithEmail(val.email, val.password).then((res)=>{
      this.onLoginSuccessful();
    }).catch((error)=>{
      this.signInError = error;
      setTimeout(() => {
        this.signInError = '';
      }, 5000);
        console.log(error);
    })
  }

  toggleEmailClicked(){
    this.signInClicked = !this.signInClicked
  }

  signInWithEmail(){
    const val = this.userForm.value;
    // const newUserBody: {email:string,password:string} = {
    //   email: val.email,
    //   password: val.password
    // };

    const newUser = this.userService.createUserByEmailPassword(val.email, val.password);
    this.onLoginSuccessful();
  }
}
