import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { Authentication, GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Observable, from } from 'rxjs';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Platform } from '@angular/cdk/platform';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private afAuth: AngularFireAuth,
              public platform: Platform,
              private router: Router,
              private db: AngularFirestore) {
               
               }

  ngOnInit() {
    // this.platform.ready().then(async () => {
  
    //   let isWeb = !this.platform.is('android') && !this.platform.is('ios');
    //   if (isWeb || this.platform.is('mobileweb'))
  
    // });
  }

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
          //  this.router.navigateByUrl('/')
           
           // localStorage.setItem('user_id', res.user?.uid);
           // let user_id = res.user?.uid;
           // this.sharedData.IsAppLoad(true);
   
           // const collectionName = 'users';
   
           // this.appService.getUserById(user_id).pipe(
           //   first()
           // ).subscribe(
           //   (res: any) => {
           //     if (res.length > 0) {
           //       // this.appService.setUserTokens(res[0].balance);
           //       // this.appService.currentUserDocId = res[0].id;
           //       localStorage.setItem('userDoc_id', res[0].id);
           //       // this.toast.showSuccessToast('User has successfully Login!');
           //       this.router.navigate(['home']);
           //     } else {
           //       this.appService.save(userObj, collectionName).subscribe(
           //         (res: any) => {
           //           this.toast.showSuccessToast('User has successfully registered!');
           //           this.router.navigate(['home']);
           //         }
           //         ,
           //         (error: any) => {
           //           //this.uos.toastService.showErrorToast(error.error.message);
           //           this.toast.showErrorToast("3" + error);
           //         }
           //       );
           //     }
           //   },
           //   (error: any) => {
           //     //this.uos.toastService.showErrorToast(error.error.message);
           //     this.toast.showErrorToast("2" + error);
           //   }
           // );
         }, (error: any) => {
           // this.toast.showErrorToast('Unable to Login due to an Unknown error');
         });
   
       }
       else {
        console.log('APPP: siginin else');
         // this.toast.showErrorToast('Unable to Login due to an Unknown error');
       }
      
    } catch (error) {
        console.log(error.message);
    }
  }
}
