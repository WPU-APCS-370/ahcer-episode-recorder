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

@Component({
  selector: 'app-view-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.scss']
})
export class ViewVideoComponent {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  videos: any[]
  loading: boolean = false;
  public fileUploading: boolean = false;
  public fileUploadMessage: string = '';
  public fileUploadError: string = '';

  constructor(private dialog: MatDialog,
              private patientService: PatientServices,
              private userService: UsersService,
              private storage: AngularFireStorage
            ) { }

  ngOnInit(): void {
    this.loadVideos();
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
          this.videos = result.videos.sort().reverse()  ?? [];
        }
      )
  }

  onDeleteVideo(videoIndex: number){
    if (videoIndex !== -1) {
      this.videos.splice(videoIndex, 1);
    }
    this.userService.updateUserVideoArray(this.videos).subscribe(()=>{
      this.fileUploadMessage = 'Video Deleted Successfully'
    }, (error)=>{
      this.setFileUploadError('Some error occured');
    })
  }

  uploadClick() {
    this.fileInput.nativeElement.click();
  }

  uploadFile(event) {
    this.fileUploadError='';
    this.fileUploadMessage='';
    this.fileUploading = true;

    const file = event.target.files[0];
    
    // Check if the selected file is a video
    if (file.type.startsWith('video/')) {
      const filePath = 'videos/' + file.name; // Define the path where you want to store the file in Firebase Storage
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
              link:  downloadURL,
              id: randomId
            });
            this.videos = this.videos.sort().reverse();
            this.userService.updateUserVideoArray(list).subscribe(()=>{
              this.fileUploadMessage = 'Video Uploaded Successfully'
            }, (error)=>{
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
      this.fileUploading= false;
      this.setFileUploadError('Invalid file format. Please select a video file.');
    }
  }

  setFileUploadError(error:string){
    this.fileUploadError = error;
      setTimeout(() => {
        this.fileUploadError=''
      }, 5000);
  }
}
