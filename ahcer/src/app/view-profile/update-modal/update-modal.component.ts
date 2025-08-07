import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-modal',
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.scss']
})
export class UpdateModalComponent {
  username:any
  constructor(
    private dialogRef: MatDialogRef<UpdateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {username}  ) {
      this.username = data
    }

  update() {
    this.dialogRef.close(this.username);
  }

  close() {
    this.dialogRef.close(false);
  }
}
