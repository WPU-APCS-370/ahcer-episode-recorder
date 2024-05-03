import { Component } from '@angular/core';
import packageJson from '../../package.json';
import {UsersService} from "./services/users.service";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public version: string = packageJson.version;
  constructor(public user: UsersService) {
  }
  public uid = this.user.userId$.subscribe((results) => this.uid = results)

  async logout() {
    await GoogleAuth.signOut();
    this.user.logout();
  }
}
