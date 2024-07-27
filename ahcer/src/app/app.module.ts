import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import {ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import { AboutComponent } from './about/about.component';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import { HomeComponent } from './home/home.component';
import {MatTableModule} from "@angular/material/table";
import {CdkTableModule} from "@angular/cdk/table";
import {PatientServices} from "./services/patient.service";
import { ViewPatientComponent } from './view-patient/view-patient.component';
import {MatCardModule} from "@angular/material/card";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import {MatDialogModule} from "@angular/material/dialog";
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { ViewEpisodeComponent } from './view-episode/view-episode.component';
import { EditEpisodeComponent } from './edit-episode/edit-episode.component';
import { LoginComponent } from './login/login.component';
import { CreateEpisodeComponent } from './create-episode/create-episode.component';
import {UsersService} from "./services/users.service";
import { DeletePatientComponent } from './delete-patient/delete-patient.component';
import { DeleteEpisodeComponent } from './delete-episode/delete-episode.component';
import {NgxMatNativeDateModule, NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { ViewEpisodesComponent } from './view-episodes/view-episodes.component';
import {DeleteMedicationComponent} from "./delete-medication/delete-medication.component";
import { ViewMedicationComponent } from './view-medication/view-medication.component';
import { CreateMedicationComponent } from './create-medication/create-medication.component';
import { EditMedicationComponent } from './edit-medication/edit-medication.component';
import {MatRadioModule} from "@angular/material/radio";
import {NgxMaskModule} from "ngx-mask";
import { HelpComponent } from './help/help.component';
import { QuillModule } from 'ngx-quill';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { EpisodeReportComponent } from './episode-report/episode-report.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorModule} from "@angular/material/paginator";
import { ReportFilterPopupComponent } from './report-filter-popup/report-filter-popup.component';
import {OverlayModule} from "@angular/cdk/overlay";
import {MatChipsModule} from "@angular/material/chips";
import {MatExpansionModule} from "@angular/material/expansion";
import {firebase, firebaseui, FirebaseUIModule} from 'firebaseui-angular';
import { ViewVideoComponent } from './view-video/view-video.component';
import { RecordVideoComponent } from './record-video/record-video.component';
import { ViewUsersComponent } from './view-users/view-users.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { getAuth } from 'firebase/auth';
import { provideAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { SettingsComponent } from './settings/settings.component';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    {
      requireDisplayName: false,
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
    },
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
};

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
    ReportFilterPopupComponent,
    ViewVideoComponent,
    RecordVideoComponent,
    ViewUsersComponent,
    SignUpComponent,
    SettingsComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase),
        // provideFirebaseApp(() => initializeApp(environment.firebase)),
        // provideAuth(() => getAuth()),
        AngularFireAuthModule,
        FirebaseUIModule.forRoot(firebaseUiAuthConfig),
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
