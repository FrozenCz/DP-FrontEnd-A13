import {RouterModule, Routes} from '@angular/router';
import {CategoriesListComponent} from './components/categories-list/categories-list.component';
import {NgModule} from '@angular/core';


const routes: Routes  = [
      {path: '', pathMatch: 'full', component: CategoriesListComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
