import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MainLocationDashboardComponent} from './dashboards/main-location-dashboard/main-location-dashboard.component';
import {
  LocationDetailDialogWrapperComponent
} from './components/location-detail-dialog-wrapper/location-detail-dialog-wrapper.component';

const routes: Routes = [
  {path: '', component: MainLocationDashboardComponent},
  {path: 'new', component: LocationDetailDialogWrapperComponent},
  {path: ':uuid', component: LocationDetailDialogWrapperComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationsRoutingModule { }
