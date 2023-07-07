import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import {ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatLegacyListModule as MatListModule} from "@angular/material/legacy-list";
import { AboutComponent } from './about/about.component';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {ReactiveFormsModule} from "@angular/forms";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatNativeDateModule} from "@angular/material/core";
import { HomeComponent } from './home/home.component';
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import {CdkTableModule} from "@angular/cdk/table";
import {PatientServices} from "./services/patient.service";
import { ViewPatientComponent } from './view-patient/view-patient.component';
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from "@angular/material/legacy-progress-spinner";
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import {MatLegacyDialogModule as MatDialogModule} from "@angular/material/legacy-dialog";
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { ViewEpisodeComponent } from './view-episode/view-episode.component';
import { EditEpisodeComponent } from './edit-episode/edit-episode.component';
import { LoginComponent } from './login/login.component';
import { CreateEpisodeComponent } from './create-episode/create-episode.component';
import {UsersService} from "./services/users.service";
import { DeletePatientComponent } from './delete-patient/delete-patient.component';
import { DeleteEpisodeComponent } from './delete-episode/delete-episode.component';
import {NgxMatNativeDateModule, NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {MatLegacySlideToggleModule as MatSlideToggleModule} from "@angular/material/legacy-slide-toggle";
import { ViewEpisodesComponent } from './view-episodes/view-episodes.component';
import {DeleteMedicationComponent} from "./delete-medication/delete-medication.component";
import { ViewMedicationComponent } from './view-medication/view-medication.component';
import { CreateMedicationComponent } from './create-medication/create-medication.component';
import { EditMedicationComponent } from './edit-medication/edit-medication.component';
import {MatLegacyRadioModule as MatRadioModule} from "@angular/material/legacy-radio";
import {NgxMaskModule} from "ngx-mask";
import { HelpComponent } from './help/help.component';
import { QuillModule } from 'ngx-quill';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { EpisodeReportComponent } from './episode-report/episode-report.component';
import {MatLegacyTooltipModule as MatTooltipModule} from "@angular/material/legacy-tooltip";
import {MatSortModule} from "@angular/material/sort";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import { ReportFilterPopupComponent } from './report-filter-popup/report-filter-popup.component';
import {OverlayModule} from "@angular/cdk/overlay";
import {MatLegacyChipsModule as MatChipsModule} from "@angular/material/legacy-chips";
import {MatExpansionModule} from "@angular/material/expansion";

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    CreatePatientComponent,
    HomeComponent,
    ViewPatientComponent,
    EditPatientComponent,
    ViewProfileComponent,
    ViewEpisodesComponent,
    ViewEpisodeComponent,
    LoginComponent,
    DeletePatientComponent,
    DeleteEpisodeComponent,
    EditEpisodeComponent,
    CreateEpisodeComponent,
    DeleteMedicationComponent,
    ViewMedicationComponent,
    CreateMedicationComponent,
    EditMedicationComponent,
    HelpComponent,
    PrivacyPolicyComponent,
    EpisodeReportComponent,
    ReportFilterPopupComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        MatListModule,
        MatTableModule,
        CdkTableModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        NgxMatDatetimePickerModule,
        MatCheckboxModule,
        NgxMatNativeDateModule,
        MatSlideToggleModule,
        QuillModule,
        MatRadioModule,
        NgxMaskModule.forRoot(),
        MatTooltipModule,
        MatSortModule,
        MatPaginatorModule,
        OverlayModule,
        MatChipsModule,
        MatExpansionModule
    ],
  providers: [
    ScreenTrackingService,UserTrackingService, PatientServices, UsersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
