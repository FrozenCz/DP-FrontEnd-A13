import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLocationDashboardComponent } from './dashboards/main-location-dashboard/main-location-dashboard.component';
import {LocationsRoutingModule} from './locations-routing.module';
import { LocationDetailComponent } from './components/location-detail/location-detail.component';
import { LocationDetailDialogWrapperComponent } from './components/location-detail-dialog-wrapper/location-detail-dialog-wrapper.component';
import { LocationListComponent } from './components/location-list/location-list.component';
import {NbButtonModule, NbCardModule, NbFormFieldModule, NbInputModule, NbSelectModule} from '@nebular/theme';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    MainLocationDashboardComponent,
    LocationDetailComponent,
    LocationDetailDialogWrapperComponent,
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
    NbButtonModule
  ]
})
export class LocationsModule { }

