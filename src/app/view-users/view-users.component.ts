import { Component } from '@angular/core';
import { UsersService } from '../services/users.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.scss']
})
export class ViewUsersComponent {
  children: any[]
  loading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private userService: UsersService,
  ) { }
  
  ngOnInit(): void {
    this.loadChildrens();
  }

  loadChildrens() {
    let currentUser: any;
    this.loading = true;
    this.userService.getCurerntUser().subscribe((res)=>{
      currentUser = res;  
      this.userService.getUserChilds(currentUser.id).subscribe((res:any)=>{
        this.loading = false;
        this.children = res;
        console.log(res, 'childs of arra');
        
      })
    })
  }

  // onDeletePatient(patient: Patient) {
  //   const dialogConfig = new MatDialogConfig();

  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.minWidth = '350px';

  //   dialogConfig.data = patient;

  //   this.dialog
  //     .open(DeletePatientComponent, dialogConfig)
  //     .afterClosed()
  //     .subscribe((val) => {
  //       if (val) {
  //         this.loadPatients()
  //       }
  //     });
  // }
}
