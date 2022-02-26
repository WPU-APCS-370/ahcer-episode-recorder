

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AboutComponent} from "./about/about.component";
import {ViewPatientComponent} from "./view-patient/view-patient.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '',
    component: HomeComponent

  },
  {
    path: 'patients',
    component: ViewPatientComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
