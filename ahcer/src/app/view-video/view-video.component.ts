import { Component, ElementRef, ViewChild } from '@angular/core';
import { Patient } from '../models/patient';
import { Medication } from '../models/medication';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PatientServices } from '../services/patient.service';
import { MedicationService } from '../services/medication.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { EditPatientComponent } from '../edit-patient/edit-patient.component';
import { DeletePatientComponent } from '../delete-patient/delete-patient.component';
import { UsersService } from '../services/users.service';
import { error } from 'console';
import { Observable } from 'rxjs';
import { user } from 'rxfire/auth';

@Component({
  selector: 'app-view-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.scss']
})
export class ViewVideoComponent {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  videos: any[] = []
  loading: boolean = false;
  public fileUploading: boolean = false;
  public fileUploadMessage: string = '';
  public fileUploadError: string = '';
  isAdmin:boolean=false

  constructor(private dialog: MatDialog,
    private patientService: PatientServices,
    private userService: UsersService,
    private storage: AngularFireStorage
  ) { }
  ngOnInit(): void {
    if (this.userService.isAdmin) {
      this.isAdmin=true
      this.loadAllVideos()
    } else {
      this.loadVideos();
    }

  }

  loadVideos() {
    this.loading = true;

    this.userService.getUserVideos()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (result) => {
          if (result.videos) {
            this.videos = result.videos;
            if (result.videos.length > 0) {
              this.videos = result.videos.sort().reverse() ?? [];
            }
          } else {
            this.videos = [];
          }
        }
      )
  }

  loadAllVideos(): void {
    this.loading = true;
    this.userService.getAllUser()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (users: any) => {
          console.log(users);

          this.videos = [];
          users.forEach(user => {
            if (user.videos) {
              user.videos.forEach(video => {
                video.userId = user.id;
                this.videos.push(video);
              });
            }
          });
          this.videos.sort((a, b) => {
            if (a.name < b.name) return 1;
            if (a.name > b.name) return -1;
            return 0;
          });

          this.loading = false;
        },
        error => {
          console.error('Error loading videos:', error);
          this.loading = false;
        }


      );
  }

  deleteFile(filePath: string): Observable<any> {
    const fileRef = this.storage.refFromURL(filePath);
    return fileRef.delete();
  }

  deleteVideoFromUser(videoIndex: number,userId?:string) {
    if (videoIndex !== -1) {
      this.videos.splice(videoIndex, 1);
    }
    this.userService.updateUserVideoArray(this.videos,userId).subscribe(() => {
      this.fileUploadMessage = 'Video Deleted Successfully'
      // this.loadVideos();
    }, (error) => {
      this.setFileUploadError('Some error occured');
    })
  }

  onDeleteVideo(videoIndex: number, videoLink: string,userId?:string) {
    const filePath = videoLink;
    this.deleteFile(filePath).subscribe(
      () => {
        this.fileUploadMessage = 'File deleted successfully';
        this.deleteVideoFromUser(videoIndex,userId)
      },
      (error) => {
        this.fileUploadError = 'Error deleting file:';
        this.loadVideos();
      }
    );
  }


  uploadClick() {
    this.fileInput.nativeElement.click();
  }

  uploadFile(event) {
    this.fileUploadError = '';
    this.fileUploadMessage = '';
    this.fileUploading = true;

    const file = event.target.files[0];

    // Check if the selected file is a video
    if (file.type.startsWith('video/')) {
      const filePath = 'videos/' + file.name;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Get the upload progress percentage
      task.percentageChanges().subscribe(percentage => {
        console.log('Upload is ' + percentage + '% done');
        this.fileUploadMessage = 'Video ' + Math.floor(percentage) + '% uploaded';
      });

      // Get the download URL when the upload is completed
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(downloadURL => {
            console.log('Video available at', downloadURL);
            this.fileUploadMessage = 'Video Uploaded Successfully!'
            const randomId = Math.floor(100000 + Math.random() * 900000).toString();
            const list = this.videos;
            list.push({
              name: file.name,
              link: downloadURL,
              id: randomId
            });
            this.videos = this.videos.sort().reverse();
            this.userService.updateUserVideoArray(list).subscribe(() => {
              this.fileUploadMessage = 'Video Uploaded Successfully'
            }, (error) => {
              console.log(error);
              this.setFileUploadError('Some error occured');
            })
          });

          setTimeout(() => {
            this.fileUploading = false;
          }, 3000);
        })
      ).subscribe();
    } else {
      this.fileUploading = false;
      this.setFileUploadError('Invalid file format. Please select a video file.');
    }
  }

  setFileUploadError(error: string) {
    this.fileUploadError = error;
    setTimeout(() => {
      this.fileUploadError = ''
    }, 5000);
  }
}
