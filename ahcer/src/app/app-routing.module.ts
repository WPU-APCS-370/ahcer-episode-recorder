

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AboutComponent} from "./about/about.component";
import {CreatePatientComponent} from "./create-patient/create-patient.component";

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent
  }, {
    path: 'create-patient',
    component: CreatePatientComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
