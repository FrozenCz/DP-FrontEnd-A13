import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UnitsListComponent} from './components/units-list/units-list.component';


const routes: Routes = [
  {path: '', component: UnitsListComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitsRoutingModule { }
