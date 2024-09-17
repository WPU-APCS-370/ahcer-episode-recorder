import { Component } from '@angular/core';
import packageJson from '../../package.json';
import {UsersService} from "./services/users.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {filter, map} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public version: string = packageJson.version;
  public appTitle: string = "E-AHC";

  constructor(public user: UsersService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private titleService: Title) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
          } else if (child.snapshot.data && child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          } else {
            return null;
          }
        }
        return null;
      })
    ).subscribe( (pageTitle: any) => {
      if (pageTitle) {
        this.titleService.setTitle(`${pageTitle} | ${this.appTitle}`);
      }
      else {
        this.titleService.setTitle(this.appTitle);
      }
    });
  }

  public uid = this.user.userId$.subscribe((results) => this.uid = results)

  logout() {
    this.user.logout();
  }
}
