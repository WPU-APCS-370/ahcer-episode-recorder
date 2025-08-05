import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Study } from 'src/app/services/study.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-study-form',
  templateUrl: './study-form.component.html',
  styleUrls: ['./study-form.component.scss']
})
export class StudyFormComponent {
  studyForm: FormGroup;
  users = [];
  piUsers = [];
  loading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private dialogRef: MatDialogRef<StudyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { study?: Study }
  ) {
    this.studyForm = this.fb.group({
      name: [data.study?.name || '', Validators.required],
      startDate: [data.study?.startDate || '', Validators.required],
      endDate: [data.study?.endDate || '', Validators.required],
      users: [data.study?.users || []],
      PI: [data.study?.PI || '', Validators.required],
      isDeleted: [false]
    });
    this.loading = true;
    this.userService.getAllUsers().subscribe((res: any) => {
      this.loading = false;
      this.users = res.filter((user: any) => user.study === data.study?.id || !user.study);
      this.piUsers = res.filter((user: any) =>
        (!user.PI || user.PI === data.study?.id) &&
        (user.study === data.study?.id || !user.study)
      );

    });

    this.studyForm.get('PI')?.valueChanges.subscribe((selectedPI: string) => {
      const usersControl = this.studyForm.get('users');
      const currentUsers = usersControl?.value || [];

      if (selectedPI && !currentUsers.includes(selectedPI)) {
        usersControl?.setValue([...currentUsers, selectedPI]);
      }
    });
  }

  save() {
    if (this.studyForm.valid) {
      const formValue = this.studyForm.value;
      const previousUsers = this.data.study?.users || [];
      const previousPI = this.data.study?.PI || '';

      const removeUsers = previousUsers.filter((user: string) => !formValue.users.includes(user));
      const removePI = previousPI && previousPI !== formValue.PI ? previousPI : '';

      this.dialogRef.close({
        formValue,
        removeUsers,
        removePI
      });
    }
  }


  close() {
    this.dialogRef.close();
  }
}
