import { Component } from '@angular/core';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  public signUpError: string = '';
  study:string = '';
  consent: string = '';
  userForm =this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    consent: [false, Validators.requiredTrue],
  });

  constructor(
    private fb: UntypedFormBuilder,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private userService: UsersService,
    private router: Router
  ) { }


ngOnInit(): void {
  this.consent = localStorage.getItem('consent');
    if (this.consent) {
      this.userForm.patchValue({ consent: true });
    }
    this.userForm.get('consent')?.valueChanges.subscribe((value: boolean) => {
    if (value === true) {
      const timestamp = Date.now().toString();
      localStorage.setItem('consent', timestamp);
      this.consent = timestamp;
    } else {
      localStorage.removeItem('consent'); 
      this.consent = '';
    }
  });
}


  async onCreateUser() {
    if (!this.userForm.valid) {
      this.signUpError = 'Consent is required to continue using the app. You may review the privacy policy or contact support with questions.';
      setTimeout(() => (this.signUpError = ''), 5000);
      return;
    }
    if (!this.consent) {
      this.signUpError =
        'Consent is required to continue using the app. You may review the privacy policy or contact support with questions.';
      setTimeout(() => (this.signUpError = ''), 5000);
      return;
    }
    const val = this.userForm.value;

    this.afAuth.app.then(cred => {
      let parentId = cred.auth().currentUser?.uid ? cred.auth().currentUser?.uid : '';
      this.userService
        .createUserByEmailPassword(val.email, val.password).then((res:any)=>{
          const childId = res.user.uid;
          if (!parentId) {
            this.userService.loginWithEmail(val.email, val.password).then((res) => {
              this.userService.onLoginSuccessful(val.username,this.consent);
            }).catch((error) => {
              console.log(error);
            });
            return;
          }
            this.db.firestore.doc(`users/${childId}`)
              .get()
              .then((doc)=> {
                const body = {
                  isParent: parentId ? false : true,
                  username:val.username,
                  email: val.email,
                  password:val.password,
                  consent: this.consent,
                  study:'',
                }
                if (parentId) {
                  body['parentId'] =  parentId;
                }
                return !doc.exists ?
                  this.db.collection(`users`).doc(childId).set(body) :
                  null;
              });
            if (parentId) {
              this.db.firestore.doc(`users/${parentId}`)
              .get()
              .then((doc)=> {
                if (doc.exists) {
                  const user = doc.data();
                  user.child ? user.child.push(childId) : user.child = [childId];
                  this.db.collection(`users`).doc(parentId).update({child:user.child, isParent: true})
                }
              });
            }
            this.router.navigateByUrl('/users')
        }).catch((error)=>{
          this.signUpError = error;
          setTimeout(() => {
            this.signUpError = '';
          }, 5000);
            console.log(error);
        })
    });

  }
}
