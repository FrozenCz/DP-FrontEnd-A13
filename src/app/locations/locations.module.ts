import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLocationDashboardComponent } from './dashboards/main-location-dashboard/main-location-dashboard.component';
import {LocationsRoutingModule} from './locations-routing.module';

@NgModule({
  declarations: [
    MainLocationDashboardComponent
  ],
  imports: [
    CommonModule,
    LocationsRoutingModule
  ]
})
export class LocationsModule { }

