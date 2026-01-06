import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('consentDialog') consentDialog!: TemplateRef<any>;
  consentForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  public signInClicked: boolean = false;
  public signInError: string = '';
  showFirebaseUI = false;
  constructor(
    public platform: Platform,
    private fb: FormBuilder,
    public userService: UsersService,
    private dialog: MatDialog
  ) {
    this.consentForm = this.fb.group({
      consent: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {}

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    consent: [false, Validators.requiredTrue],
  });

  emailLogin() {
    if (!this.userForm.valid) {
      this.signInError =
        'Consent is required to continue using the app. You may review the privacy policy or contact support with questions.';
      setTimeout(() => (this.signInError = ''), 5000);
      return;
    }
    const val = this.userForm.getRawValue();

    this.userService
      .loginWithEmail(val.email, val.password)
      .then((res) => {
        this.userService.onLoginSuccessful();
      })
      .catch((error) => {
        this.signInError = error;
        setTimeout(() => {
          this.signInError = '';
        }, 5000);
        console.log(error);
      });
  }

  toggleEmailClicked() {
    this.signInClicked = !this.signInClicked;
  }

  passwordReset() {
    let { email } = this.userForm.value;
    if (email) {
      this.userService
        .passwordRest(email)
        .then((res) => {
          alert('Check Email and reset password');
        })
        .catch((error) => {
          this.signInError = error;
          setTimeout(() => {
            this.signInError = '';
          }, 5000);
          console.log(error);
        });
    }
  }

  openConsentDialog() {
    this.dialogRef = this.dialog.open(this.consentDialog, {
      width: '400px',
    });
  }

  async onConsentContinue() {
    this.dialogRef.close(true);

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      this.userService.onLoginSuccessful();
    } catch (err) {
      console.error(err);
    }
  }
}
