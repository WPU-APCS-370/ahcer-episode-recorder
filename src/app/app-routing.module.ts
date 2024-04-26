import {inject, NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AboutComponent} from "./about/about.component";
import {CreatePatientComponent} from "./create-patient/create-patient.component";
import {ViewPatientComponent} from "./view-patient/view-patient.component";
import {HomeComponent} from "./home/home.component";
import {ViewProfileComponent} from "./view-profile/view-profile.component";
import {LoginComponent} from "./login/login.component";
import {CreateEpisodeComponent} from "./create-episode/create-episode.component";
import {ViewEpisodesComponent} from "./view-episodes/view-episodes.component";
import {ViewMedicationComponent} from "./view-medication/view-medication.component";
import {redirectUnauthorizedTo} from "@angular/fire/auth-guard";
import { canActivate } from '@angular/fire/compat/auth-guard';
import {HelpComponent} from "./help/help.component";
import {PrivacyPolicyComponent} from "./privacy-policy/privacy-policy.component";
import {EpisodeReportComponent} from "./episode-report/episode-report.component";
import {UsersService} from "./services/users.service";
import {first} from "rxjs";



const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [

  { path: '',
    component: HomeComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'patients',
    component: ViewPatientComponent,
    ...canActivate(redirectUnauthorizedToLogin)

  },
  {
    path: 'add-patient',
    component: CreatePatientComponent,
    ...canActivate(redirectUnauthorizedToLogin)

  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'add-patient',
    component: CreatePatientComponent,
    ...canActivate(redirectUnauthorizedToLogin)

  },
  {
    path: 'view-profile',
    component: ViewProfileComponent,
    resolve: {
      userId: () => inject(UsersService).userId$.pipe(first()),
    },
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'help',
    component: HelpComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'patients',
    component: ViewPatientComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'record-episode',
    component: CreateEpisodeComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'episodes',
    component: ViewEpisodesComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'medications',
    component: ViewMedicationComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'episode-report',
    component: EpisodeReportComponent,
   ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
