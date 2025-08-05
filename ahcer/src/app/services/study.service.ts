import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface Study {
  id?: string;
  name: string;
  users: string[];
  PI: string;
  startDate: Date;
  endDate: Date;
  isDeleted?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class StudyService {
  private collectionName = 'studies';

  constructor(private firestore: AngularFirestore) {}

  getStudies(): Observable<Study[]> {
    return this.firestore.collection<Study>(
      this.collectionName,
      ref => ref.where('isDeleted', '==', false)
    ).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Study;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }


  getStudyById(id: string): Observable<Study | undefined> {
    return this.firestore.doc<Study>(`${this.collectionName}/${id}`).valueChanges();
  }

  addStudy(study: Study): Promise<any> {
    return this.firestore.collection<Study>(this.collectionName).add(study);
  }

  updateStudy(id: string, study: any): Promise<void> {
    return this.firestore.doc<Study>(`${this.collectionName}/${id}`).update(study);
  }
  getStudiesForToday(): Observable<Study[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.getStudies().pipe(
      map(studies =>
        studies.filter(study => {
          const start = this.toDate(study.startDate);
          const end = this.toDate(study.endDate);
          return start <= today && today <= end;
        })
      )
    );
  }
  private toDate(input: any): Date {
    return input?.seconds ? new Date(input.seconds * 1000) : new Date(input);
  }
  updateUserStudy(study: string,userId:string): Promise<void> {
    return this.firestore.doc(`users/${userId}`).update({
      study: study
    });
  }
  async updateUsersAndPI(studyId: string, userIds: string[], piId: string) {
    const batch = this.firestore.firestore.batch();

    for (const userId of userIds) {
      const userRef = this.firestore.doc(`users/${userId}`).ref;
      batch.update(userRef, { study: studyId });
    }

    const piRef = this.firestore.doc(`users/${piId}`).ref;
    batch.update(piRef, { PI: studyId });

    await batch.commit();
  }
  removeUsersAndPI(userIds: string[], piId: string): Promise<void> {
    const batch = this.firestore.firestore.batch();

    for (const userId of userIds) {
      const userRef = this.firestore.doc(`users/${userId}`).ref;
      batch.update(userRef, { study: '' });
    }

    if (piId) {
      const piRef = this.firestore.doc(`users/${piId}`).ref;
      batch.update(piRef, { PI: '' });
    }

    return batch.commit();
  }

}
