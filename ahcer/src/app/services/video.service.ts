import { Injectable } from '@angular/core';
import { first, from, map, Observable, of, switchMap } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { arrayUnion } from '@angular/fire/firestore';
import { AngularFireAuth } from "@angular/fire/compat/auth";

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  currentUser$: Observable<any>;
  userId$: Observable<any>;
  newUserId$: Observable<string>;

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
  ) {
    this.newUserId$ = afAuth.authState.pipe(map(user => user ? user.uid : null));
    this.userId$ = this.getCurerntUser().pipe(
      map((user: any) => user ? (user['parentId'] ? user['parentId'] : user.id) : null)
    );
  }

  // ✅ Get logged-in user
  getCurerntUser(): Observable<any> {
    this.currentUser$ = this.newUserId$.pipe(
      switchMap(userId =>
        this.db.doc<any>(`users/${userId}`).get().pipe(
          map(docSnapshot => {
            if (docSnapshot.exists) {
              const data = docSnapshot.data();
              const id = docSnapshot.id;
              return { id, ...data };
            } else {
              return null;
            }
          })
        )
      ),
      first()
    )
    return this.currentUser$;
  }

  // ✅ Get all videos of user
  getUserVideos(): Observable<any> {
    return this.userId$.pipe(
      switchMap(resUserId =>
        this.db.doc(`users/${resUserId}`).get().pipe(
          map(snapshot => snapshot.data())
        )
      ),
      first()
    );
  }

  // ✅ Add new video to Firestore
  addUserVideoArray(video: any, userId?: string): Observable<any> {
    return this.userId$.pipe(
      switchMap(uid =>
        from(
          this.db.doc(`users/${userId ? userId : uid}`).update({
            videos: arrayUnion(video)
          })
        )
      ),
      first()
    );
  }

  // ✅ Update a specific video entry
  updateUserVideo(videoId: string, data: any, userId?: string): Observable<void> {
    return this.userId$.pipe(
      switchMap(uid => {
        const finalUid = userId || uid;
        return this.db.doc<any>(`users/${finalUid}`).get().pipe(
          switchMap(snapshot => {
            const userData = snapshot.data();
            if (!userData) throw new Error('User not found');
            const videos = userData.videos || [];

            const updatedVideos = videos.map((v: any) =>
              v.id === videoId ? { ...v, ...data } : v
            );

            return from(
              this.db.doc(`users/${finalUid}`).update({ videos: updatedVideos })
            );
          })
        );
      }),
      first()
    );
  }

  // ✅ Delete file from Storage
  deleteFile(fileUrl: string): Observable<any> {
    const fileRef = this.storage.refFromURL(fileUrl);
    return fileRef.delete();
  }

  // ✅ Delete video from Storage + Firestore
  deleteUserVideo(video: any, userId?: string): Observable<any> {
    return this.userId$.pipe(
      switchMap(uid => {
        const finalUid = userId || uid;

        // Step 1: delete from storage
        return this.deleteFile(video.link).pipe(
          switchMap(() =>
            // Step 2: remove from Firestore
            this.db.doc<any>(`users/${finalUid}`).get().pipe(
              switchMap(snapshot => {
                const userData = snapshot.data();
                if (!userData) throw new Error('User not found');
                const videos = userData.videos || [];

                const updatedVideos = videos.filter((v: any) => v.id !== video.id);

                return from(
                  this.db.doc(`users/${finalUid}`).update({ videos: updatedVideos })
                );
              })
            )
          )
        );
      }),
      first()
    );
  }
}
