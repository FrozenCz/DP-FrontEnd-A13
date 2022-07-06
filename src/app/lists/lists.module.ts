import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListsComponent} from './lists.component';
import {ListsRoutingModule} from './lists-routing.module';
import { WorkingListComponent } from './components/working-list/working-list.component';
import {AssetsModule} from '../assets/assets.module';
import {FlexModule} from '@angular/flex-layout';
import {
    NbButtonModule,
    NbCardModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbSidebarModule,
    NbToggleModule, NbTooltipModule
} from '@nebular/theme';
import {ReactiveFormsModule} from '@angular/forms';
import { ListsListComponent } from './components/lists-list/lists-list.component';
import {AgGridModule} from 'ag-grid-angular';
import { DeleteListDialogComponent } from './components/delete-list-dialog/delete-list-dialog.component';
import { ListDetailComponent } from './components/list-detail/list-detail.component';
import {SharedModule} from '../utils/shared.module';
import { SaveListComponent } from './components/save-list/save-list.component';



@NgModule({
    declarations: [
        ListsComponent,
        WorkingListComponent,
        ListsListComponent,
        DeleteListDialogComponent,
        ListDetailComponent,
        SaveListComponent,
    ],
    imports: [
        CommonModule,
        ListsRoutingModule,
        AssetsModule,
        FlexModule,
        NbSidebarModule,
        NbButtonModule,
        NbIconModule,
        NbFormFieldModule,
        ReactiveFormsModule,
        NbInputModule,
        NbToggleModule,
        AgGridModule,
        NbCardModule,
        SharedModule,
        NbTooltipModule
    ],
    bootstrap: [ListsComponent],
    exports: [
        WorkingListComponent
    ]
})
export class ListsModule { }
