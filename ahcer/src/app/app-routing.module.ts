import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AboutComponent} from "./about/about.component";
import {CreatePatientComponent} from "./patient-components/create-patient/create-patient.component";
import {ViewPatientComponent} from "./patient-components/view-patient/view-patient.component";
import {HomeComponent} from "./home/home.component";
import {ViewProfileComponent} from "./user-components/view-profile/view-profile.component";
import {LoginComponent} from "./user-components/login/login.component";
import {CreateEpisodeComponent} from "./episode-components/create-episode/create-episode.component";
import {ViewEpisodesComponent} from "./episode-components/view-episodes/view-episodes.component";
import {ViewMedicationComponent} from "./medication-components/view-medication/view-medication.component";
import {redirectUnauthorizedTo, redirectLoggedInTo} from "@angular/fire/auth-guard";
import {AuthPipeGenerator, canActivate} from '@angular/fire/compat/auth-guard';
import {HelpComponent} from "./help/help.component";
import { UserIdResolver } from "./services/user-id.resolver";
import {PrivacyPolicyComponent} from "./privacy-policy/privacy-policy.component";
import {EpisodeReportComponent} from "./report-components/episode-report/episode-report.component";



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
      userId: UserIdResolver,
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
