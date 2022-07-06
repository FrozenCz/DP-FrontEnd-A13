import {NgModule} from '@angular/core';
import {BarUnderAgGridComponent} from './agGrid/bar-under-ag-grid/bar-under-ag-grid.component';
import {NbActionsModule, NbButtonModule, NbCheckboxModule, NbIconModule, NbTooltipModule} from '@nebular/theme';
import {FlexModule} from '@angular/flex-layout';
import {CommonModule} from '@angular/common';
import { FloatFilterResetComponent } from './agGrid/float-filter-reset/float-filter-reset.component';
import {ViewsBarComponent} from './agGrid/views-bar/views-bar.component';
import {AgGridModule} from 'ag-grid-angular';


@NgModule({
  declarations: [
    BarUnderAgGridComponent,
    FloatFilterResetComponent,
    ViewsBarComponent,
  ],
    imports: [
        NbIconModule,
        FlexModule,
        NbCheckboxModule,
        CommonModule,
        NbButtonModule,
        NbActionsModule,
        AgGridModule,
        NbTooltipModule
    ],
  exports: [
    BarUnderAgGridComponent,
    ViewsBarComponent
  ]
})
export class SharedModule {

}
