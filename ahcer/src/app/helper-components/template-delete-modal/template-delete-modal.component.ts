import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {catchError, Observable, tap, throwError} from "rxjs";

export class DeleteModelOpener {
  constructor(private dialog: MatDialog) {
  }
  openModal(modelName: string,
            prompt: string,
            deleteHandleObservable: Observable<any>,
            onDialogResult: ()=>void) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '350px';

    dialogConfig.data = [modelName, prompt, deleteHandleObservable];

    this.dialog
      .open(TemplateDeleteModalComponent, dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          onDialogResult()
        }
      });
  }
}

@Component({
  selector: 'app-template-delete-modal',
  templateUrl: './template-delete-modal.component.html',
  styleUrls: ['./template-delete-modal.component.scss']
})
export class TemplateDeleteModalComponent implements OnInit {

  modelName: string;
  prompt: string;
  deleteHandleObservable: Observable<any>;

  constructor(private dialogRef: MatDialogRef<TemplateDeleteModalComponent>,
              @Inject(MAT_DIALOG_DATA) [modelName, prompt, deleteHandleObservable]:
                [string, string, Observable<any>]) {
    this.deleteHandleObservable = deleteHandleObservable;
    this.modelName = modelName;
    this.prompt = prompt;
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close()
  }

  delete(): void {
    this.deleteHandleObservable
      .pipe(
        tap(() => {
          this.dialogRef.close({successfullyDeleted: true});
        }),
        catchError(err => {
          console.log(err);
          alert(`could not delete ${this.modelName}.`);
          return throwError(err);
        })
      )
      .subscribe()
  }
}
