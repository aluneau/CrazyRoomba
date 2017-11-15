import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule } from '@angular/forms';
import { FilterPipe} from "./pipe.filter";
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import {PageNotFoundComponent} from './page-not-found.component/page-not-found.component'
import {SensorsComponent} from "./sensors.component/sensors.component"

const appRoutes: Routes = [
  { path: 'sensors', component: SensorsComponent },
  { path: '',
    redirectTo: '/sensors',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    SensorsComponent,
    PageNotFoundComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MDBBootstrapModule.forRoot(),    
    MatToolbarModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes
      )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
