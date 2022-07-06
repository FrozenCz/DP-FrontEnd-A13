import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { HistoryListComponent } from './components/history-list/history-list.component';
import {HistoryService} from './history.service';
import {SharedModule} from '../utils/shared.module';
import {AgGridModule} from 'ag-grid-angular';
import {FlexModule} from '@angular/flex-layout';
import { HistoryDetailComponent } from './components/history-detail/history-detail.component';
import {NbCardModule, NbIconModule} from '@nebular/theme';


const routes: Routes = [
  {path: '', component: HistoryListComponent}
];


@NgModule({
  declarations: [
    HistoryListComponent,
    HistoryDetailComponent
  ],
  exports: [
    HistoryListComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    AgGridModule,
    FlexModule,
    NbCardModule,
    NbIconModule
  ]
})
export class HistoryModule { }
