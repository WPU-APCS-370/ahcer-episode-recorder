import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-video-dialog',
  templateUrl: './add-video-dialog.component.html',
  styleUrls: ['./add-video-dialog.component.scss']
})
export class AddVideoDialogComponent {
  fileUploading = false;
  fileUploadMessage = '';
  fileUploadError = '';
  videoTitle = '';
  selectedFile: File | null = null;

  constructor(
    private storage: AngularFireStorage,
    private dialogRef: MatDialogRef<AddVideoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      if (!this.selectedFile.type.startsWith('video/')) {
        this.fileUploadError = 'Invalid file format. Please select a video file.';
        this.selectedFile = null;
      }
    }
  }

  uploadVideo() {
    if (!this.selectedFile || !this.videoTitle.trim()) {
      this.fileUploadError = 'Please enter title and select a video file.';
      return;
    }

    this.fileUploading = true;
    const filePath = `videos/${Date.now()}_${this.selectedFile.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, this.selectedFile);

    task.percentageChanges().subscribe(progress => {
      this.fileUploadMessage = `Uploading... ${Math.floor(progress || 0)}%`;
    });

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(downloadURL => {
          this.fileUploadMessage = 'Video Uploaded Successfully!';
          this.fileUploading = false;
          const randomId = Math.floor(100000 + Math.random() * 900000).toString();
          this.dialogRef.close({
            title: this.videoTitle,
            link: downloadURL,
            name: this.selectedFile?.name,
            id: randomId
          });
        });
      })
    ).subscribe();
  }
  saveVideo() {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    this.dialogRef.close({
      title: this.videoTitle,
      link: 'https://www.youtube.com/shorts/L4a4Mpq_SCw?feature=share',
      name: 'name'+this.videoTitle,
      id: randomId
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
