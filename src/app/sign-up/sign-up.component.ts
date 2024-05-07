import { Component } from '@angular/core';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { first, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  public signUpError: string = '';

  userForm =this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: UntypedFormBuilder,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private userService: UsersService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  async onCreateUser() {
    const val = this.userForm.value;

    this.afAuth.app.then(cred => {
      let parentId = cred.auth().currentUser.uid ?? '';
      this.userService
        .createUserByEmailPassword(val.email, val.password).then((res:any)=>{
          const childId = res.user.uid;
            this.db.firestore.doc(`users/${childId}`)
              .get()
              .then((doc)=> {
                const body = {
                  parentId, 
                  isParent:false,
                  username:val.username, 
                  email: val.email,
                  password:val.password
                }
                return !doc.exists ?
                  this.db.collection(`users`).doc(childId).set(body) :
                  null;
              });
            this.db.firestore.doc(`users/${parentId}`)
              .get()
              .then((doc)=> {
                if (doc.exists) {
                  const user = doc.data();
                  user.child ? user.child.push(childId) : user.child = [childId];
                  this.db.collection(`users`).doc(parentId).update({child:user.child, isParent: true})
                }
              });
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
