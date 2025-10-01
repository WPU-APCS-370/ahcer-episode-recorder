import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { UsersService } from '../services/users.service';
import { Observable } from 'rxjs';
import { AddVideoDialogComponent } from './add-video-dialog/add-video-dialog.component';
import { VideoService } from '../services/video.service';

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
editIndex
  constructor(private dialog: MatDialog,
    private userService: UsersService,
    private storage: AngularFireStorage,
    private videoService: VideoService
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
          console.log(result);
          
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

  setFileUploadError(error: string) {
    this.fileUploadError = error;
    setTimeout(() => {
      this.fileUploadError = ''
    }, 5000);
  }
  openAddVideoDialog() {
  const dialogRef = this.dialog.open(AddVideoDialogComponent, {
    width: '400px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Add new video to local list
      this.videos.push(result);
      this.videos = this.videos.sort().reverse();

      // Save to user
      this.userService.updateUserVideoArray(this.videos).subscribe(() => {
        this.fileUploadMessage = 'Video Saved Successfully!';
      }, () => {
        this.setFileUploadError('Some error occurred while saving.');
      });
    }
  });
}
startEdit(index: number) {
  this.editIndex = index;
}

cancelEdit() {
  this.editIndex = null;
}

saveTitle(video: any, index: number, userId?: string) {
  if (!video.title || video.title.trim() === '') {
    this.setFileUploadError('Title cannot be empty');
    return;
  }

  this.videoService.updateUserVideo(video.id, { title: video.title }, userId)
    .subscribe(
      () => {
        this.fileUploadMessage = 'Title updated successfully!';
        this.editIndex = null; // exit edit mode
      },
      () => {
        this.setFileUploadError('Error updating title');
      }
    );
}

}
