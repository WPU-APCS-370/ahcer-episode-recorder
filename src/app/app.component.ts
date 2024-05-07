import { AfterContentInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import packageJson from '../../package.json';
import {UsersService} from "./services/users.service";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { User } from './models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterContentInit {
  public version: string = packageJson.version;
  public uid = this.user.userId$.subscribe((results) => this.uid = results)
  public unsubscribe: Subscription[] = [];
  public currentUser: any;

  constructor(public user: UsersService, private cdRef: ChangeDetectorRef) {
  }


  ngAfterContentInit(): void {
    // this.getCurrentUser();
  }
  
  ngOnInit(): void {
    // this.getCurrentUser();
  }
  
  // getCurrentUser(){
  //   this.unsubscribe.push(
  //     this.user.getCurerntUser().subscribe((res: User)=>{
  //       this.currentUser = res;
  //       this.cdRef.detectChanges();
  //       console.log(this.currentUser, 'current user');
  //     })
  //   )
  // }

  get isParent(){
    const data = JSON.parse(localStorage.getItem('user'));
    return data ? data.isParent : false;
  }
  
  async logout() {
    await GoogleAuth.signOut();
    this.user.logout();
    localStorage.removeItem('user')
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
