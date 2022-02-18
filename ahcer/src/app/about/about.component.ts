import { Component, OnInit } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(private db: AngularFirestore) { }

  ngOnInit(): void {
  }

  onReadDoc() {
    this.db.doc('users/7ZA7KNV0fYbo19SXYHkC/patients/c5fSiohs3Ze5gsP6Ivh8')
      .snapshotChanges()
      .subscribe(snap => {
        console.log(snap.payload.id);
        console.log(snap.payload.data());
      });
  }

  onReadCollection() {
    this.db.collection('users/7ZA7KNV0fYbo19SXYHkC/patients',
      ref => ref.orderBy('lastName')
    ).get().subscribe(
      snaps => {
        snaps.forEach(snap => {
          console.log(snap.id);
          console.log(snap.data());
        });
      }
    );
  }
}
