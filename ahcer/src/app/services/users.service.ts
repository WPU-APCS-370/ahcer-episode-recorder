import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private db: AngularFirestore) { }

  getUserById(userId: string): Observable<any> {
    return this.db.doc(`users/${userId}`).valueChanges();
  }
}
