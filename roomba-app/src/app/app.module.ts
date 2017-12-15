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
import { MapComponent } from './map.component/map.component';
import { HttpClientModule } from '@angular/common/http';
import { GrahamMapComponent } from './mapgraham.component/mapgraham.component';

const appRoutes: Routes = [
  { path: 'sensors', component: SensorsComponent },
  { path: '',
    redirectTo: '/sensors',
    pathMatch: 'full'
  },
  { path: 'map', component: MapComponent},
  { path: 'mapgraham', component: GrahamMapComponent},
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    SensorsComponent,
    PageNotFoundComponent,
    MapComponent,
    GrahamMapComponent,
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
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes
      )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
