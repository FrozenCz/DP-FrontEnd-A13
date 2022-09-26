import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MainLocationDashboardComponent} from './dashboards/main-location-dashboard/main-location-dashboard.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'all'},
  {path: ':uuid', component: MainLocationDashboardComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationsRoutingModule {
}
