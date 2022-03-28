import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AboutComponent} from "./about/about.component";
import {CreatePatientComponent} from "./create-patient/create-patient.component";
import {ViewPatientComponent} from "./view-patient/view-patient.component";
import {HomeComponent} from "./home/home.component";
import {ViewProfileComponent} from "./view-profile/view-profile.component";
import {LoginComponent} from "./login/login.component";
import {CreateEpisodeComponent} from "./create-episode/create-episode.component";
import {ViewEpisodesComponent} from "./view-episodes/view-episodes.component";

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'add-patient',
    component: CreatePatientComponent
  },
  {
    path: 'view-profile/:userId',
    component: ViewProfileComponent
  },
  {
    path: '',
    component: HomeComponent

  },
  {
    path: 'patients',
    component: ViewPatientComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'record-episode',
    component: CreateEpisodeComponent
  },
  {
    path: 'episodes',
    component: ViewEpisodesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
