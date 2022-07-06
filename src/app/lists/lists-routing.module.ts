import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListsComponent} from './lists.component';
import {WorkingListComponent} from './components/working-list/working-list.component';
import {ListsListComponent} from './components/lists-list/lists-list.component';
import {ListDetailComponent} from './components/list-detail/list-detail.component';


const routes: Routes = [
  {path: '', component: ListsComponent, children: [
      {path: '', component: ListsListComponent},
      {path: 'working-list', component: WorkingListComponent,
        data: {loadWorkingList: true}},
      {path: 'list/:id', component: ListDetailComponent},
    ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ListsRoutingModule {
}
