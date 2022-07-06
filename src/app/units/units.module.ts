import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateUnitDialogComponent } from './components/create-unit-dialog/create-unit-dialog.component';
import {
    NbBadgeModule,
    NbButtonModule,
    NbCardModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule, NbPopoverModule,
    NbSelectModule, NbSpinnerModule,
    NbTooltipModule, NbTreeGridModule
} from '@nebular/theme';
import {FlexModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import { UnitsListComponent } from './components/units-list/units-list.component';
import {AgGridModule} from 'ag-grid-angular';
import { EditUnitDialogComponent } from './components/edit-unit-dialog/edit-unit-dialog.component';
import { DeleteUnitDialogComponent } from './components/delete-unit-dialog/delete-unit-dialog.component';
import {UnitsRoutingModule} from './units-routing.module';

@NgModule({
  declarations: [CreateUnitDialogComponent, UnitsListComponent, EditUnitDialogComponent, DeleteUnitDialogComponent],
    imports: [
        UnitsRoutingModule,
        CommonModule,
        NbCardModule,
        NbIconModule,
        NbFormFieldModule,
        NbSelectModule,
        FlexModule,
        NbInputModule,
        NbButtonModule,
        ReactiveFormsModule,
        NbBadgeModule,
        NbTooltipModule,
        NbPopoverModule,
        NbTreeGridModule,
        AgGridModule,
        NbSpinnerModule,
    ]
})
export class UnitsModule { }
