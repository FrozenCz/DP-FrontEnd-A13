import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LocationsComponent} from './locations.component';

const routes: Routes = [
  {path: '', component: LocationsComponent}
];


@NgModule({
  declarations: [
    LocationsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class LocationsModule { }

