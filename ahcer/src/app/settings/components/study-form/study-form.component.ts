import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Study } from 'src/app/services/study.service';

@Component({
  selector: 'app-study-form',
  templateUrl: './study-form.component.html',
  styleUrls: ['./study-form.component.scss']
})
export class StudyFormComponent {
  studyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StudyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { study?: Study }
  ) {
    this.studyForm = this.fb.group({
      name: [data.study?.name || '', Validators.required],
      startDate: [data.study?.startDate || '', Validators.required],
      endDate: [data.study?.endDate || '', Validators.required],
      isDeleted:[false]
    });
  }

  save() {
    if (this.studyForm.valid) {
      this.dialogRef.close(this.studyForm.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
