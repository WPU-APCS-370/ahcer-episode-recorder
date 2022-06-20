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
import {ViewMedicationComponent} from "./view-medication/view-medication.component";
import {redirectUnauthorizedTo} from "@angular/fire/auth-guard";
import {AuthPipeGenerator, canActivate} from '@angular/fire/compat/auth-guard';
import {HelpComponent} from "./help/help.component";
import { UserIdResolver } from "./services/user-id.resolver";
import {PrivacyPolicyComponent} from "./privacy-policy/privacy-policy.component";
import {EpisodeReportComponent} from "./episode-report/episode-report.component";



const redirectUnauthorizedToLogin: AuthPipeGenerator = () => redirectUnauthorizedTo(['login']);

function customPayload(title: string, authPipe?: AuthPipeGenerator) {
  let payload: {canActivate?: any[], data: {title?: string, authGuardPipe?: AuthPipeGenerator}} = {data: { }};
  if(authPipe) {
    payload = canActivate(authPipe);
  }
  payload.data.title = title;
  return payload;
}

const routes: Routes = [

  { path: '',
    component: HomeComponent,
    ...customPayload("Home", redirectUnauthorizedToLogin)
  },
  {
    path: 'patients',
    component: ViewPatientComponent,
    ...customPayload("Patient Listing", redirectUnauthorizedToLogin)

  },
  {
    path: 'add-patient',
    component: CreatePatientComponent,
    ...customPayload("Add Patient", redirectUnauthorizedToLogin)

  },
  {
    path: 'about',
    component: AboutComponent,
    ...customPayload("About")
  },
  {
    path: 'view-profile',
    component: ViewProfileComponent,
    resolve: {
      userId: UserIdResolver,
    },
    ...customPayload("User Profile", redirectUnauthorizedToLogin)
  },
  {
    path: 'help',
    component: HelpComponent,
    ...customPayload("Help", redirectUnauthorizedToLogin)
  },
  {
    path: 'login',
    component: LoginComponent,
    ...customPayload("Login")
  },
  {
    path: 'record-episode',
    component: CreateEpisodeComponent,
    ...customPayload("Record Episode", redirectUnauthorizedToLogin)
  },
  {
    path: 'episodes',
    component: ViewEpisodesComponent,
    ...customPayload("Episode Listing", redirectUnauthorizedToLogin)
  },
  {
    path: 'medications',
    component: ViewMedicationComponent,
    ...customPayload("Manage Medications", redirectUnauthorizedToLogin)
  },
  {
    path: 'episode-report',
    component: EpisodeReportComponent,
   ...customPayload("Episode Report", redirectUnauthorizedToLogin)
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    ...customPayload("Privacy Policy")
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
