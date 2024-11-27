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
  isAdmin:boolean=false
  constructor(
    private dialog: MatDialog,
    private userService: UsersService,
  ) { }
  ngOnInit(): void {
    if (this.userService.isAdmin) {
      this.isAdmin=true
      this.loadAllChildrens()
    } else {
      this.loadChildrens();
    }

  }

  loadChildrens() {
    let currentUser: any;
    this.loading = true;
    this.userService.getCurerntUser().subscribe((res) => {
      currentUser = res;
      this.userService.getUserChilds(currentUser.id).subscribe((res: any) => {
        this.loading = false;
        this.children = res;
        console.log(res, 'childs of arra');

      })
    })
  }
  loadAllChildrens() {
    this.loading = true;
    this.userService.getAllUser().subscribe((res: any) => {
      this.loading = false;
      this.children = res;
      console.log(res, 'all childs of arra');

    })
  }

  async deleteUser(id: string) {
    try {
      const response:any = await this.userService.deleteAccount(id)
      console.log(response);

      await this.userService.deleteUserDoc(id);
      this.loadChildrens();
      alert(response.message);

    } catch (error) {
      console.error('Error deleting user:', error);
      alert('There was an error deleting the user. Please try again later.');
    }
  }

  resetPassword(email:string){
    this.userService.passwordRest(email).then((res) => {
      alert('To reset password email has been sent.')
    }).catch((error) => {
      console.error(error)
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
