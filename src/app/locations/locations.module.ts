import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLocationDashboardComponent } from './dashboards/main-location-dashboard/main-location-dashboard.component';
import {LocationsRoutingModule} from './locations-routing.module';
import { LocationDetailComponent } from './components/location-detail/location-detail.component';
import { LocationDetailWrapperComponent } from './components/location-detail-wrapper/location-detail-wrapper.component';
import { LocationListComponent } from './components/location-list/location-list.component';
import {NbButtonModule, NbCardModule, NbFormFieldModule, NbInputModule, NbSelectModule} from '@nebular/theme';
import {FormsModule} from '@angular/forms';
import {FlexModule} from '@angular/flex-layout';
import {AgGridModule} from 'ag-grid-angular';

@NgModule({
  declarations: [
    MainLocationDashboardComponent,
    LocationDetailComponent,
    LocationDetailWrapperComponent,
    LocationListComponent
  ],
  imports: [
    CommonModule,
    LocationsRoutingModule,
    NbCardModule,
    NbSelectModule,
    FormsModule,
    NbFormFieldModule,
    NbInputModule,
    NbButtonModule,
    FlexModule,
    AgGridModule
  ]
})
export class LocationsModule { }

