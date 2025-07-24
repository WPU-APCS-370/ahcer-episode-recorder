import { Component } from '@angular/core';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { first, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { StudyService } from '../services/study.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  public signUpError: string = '';
  study:string = '';
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
    private studyService: StudyService,
    private router: Router
  ) { }


ngOnInit(): void {
  this.studyService.getStudiesForToday().subscribe(data => {
    this.study = data.length > 0 && data[0]?.id ? data[0].id : '';
  });
}


  async onCreateUser() {
    const val = this.userForm.value;

    this.afAuth.app.then(cred => {
      let parentId = cred.auth().currentUser?.uid ? cred.auth().currentUser?.uid : '';
      this.userService
        .createUserByEmailPassword(val.email, val.password).then((res:any)=>{
          const childId = res.user.uid;
            this.db.firestore.doc(`users/${childId}`)
              .get()
              .then((doc)=> {
                const body = {
                  isParent: parentId ? false : true,
                  username:val.username,
                  email: val.email,
                  password:val.password,
                  study:this.study,
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
