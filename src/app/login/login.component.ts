import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { Authentication, GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
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
          return !doc.exists ?
            this.db.collection(`users`).doc(uid).set({}) :
            null;
        });
    });
    this.router.navigateByUrl('/')
  }

  async initializeApp() {
    // this.platform.ready().then(() => {
      await GoogleAuth.initialize()
    // })
  }

  AuthLoginWithGoogleCredentials(authentication: Authentication): Observable<any> {

    const authCredential = GoogleAuthProvider.credential(authentication.idToken);
    return from(this.afAuth.signInWithCredential(authCredential));
    // return from(this.afAuth.signInAndRetrieveDataWithCredential(authCredential));
  }

  async googleLogin() {

    try {
      await this.initializeApp();
       const googleUser = await GoogleAuth.signIn();
       if (googleUser) {
         this.AuthLoginWithGoogleCredentials(googleUser.authentication).subscribe(res => {
           let userObj = {
             uid: res.user?.uid,
             email: res.user?.email,
             displayName: res.user?.displayName,
             photoURL: res.user?.photoURL,
           }

           this.onLoginSuccessful();

         }, (error: any) => {
          this.signInError = error;
          setTimeout(() => {
            this.signInError = '';
          }, 5000);
            console.log(error);
         });
   
       }
       else {
        console.log('APPP: siginin else');
       }
      
    } catch (error) {
        console.log(error.message);
    }
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
