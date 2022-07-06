import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CreateUserDialogComponent} from './components/create-user-dialog/create-user-dialog.component';
import {
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbLayoutModule,
  NbSelectModule, NbSpinnerModule, NbTabsetModule, NbToggleModule,
  NbTooltipModule, NbWindowModule
} from '@nebular/theme';
import {FlexModule} from '@angular/flex-layout';
import {UsersListComponent} from './components/users-list/users-list.component';
import {AgGridModule} from 'ag-grid-angular';
import 'ag-grid-enterprise';
import {UsersComponent} from './users.component';
import {RouterModule} from '@angular/router';
import {UserDetailComponent} from './components/user-detail/user-detail.component';
import {ReactiveFormsModule} from '@angular/forms';
import { DeleteSelectedUsersDialogComponent } from './components/delete-selected-users-dialog/delete-selected-users-dialog.component';
import { ShowRightsSettingDialogComponent } from './components/show-rights-setting-dialog/show-rights-setting-dialog.component';
import {ExactFilterPipe} from '../pipes/exactFilter.pipe';
import { SelectUnitCellRendererComponent } from './components/select-unit-cell-renderer/select-unit-cell-renderer.component';
import {UsersRoutingModule} from './users-routing.module';
import { SelectUserCellRendererComponent } from './components/select-user-cell-renderer/select-user-cell-renderer.component';
import {AssetsModule} from '../assets/assets.module';


@NgModule({
    declarations: [
        CreateUserDialogComponent,
        UsersComponent,
        UsersListComponent,
        UserDetailComponent,
        DeleteSelectedUsersDialogComponent,
        ShowRightsSettingDialogComponent,
        ExactFilterPipe,
        SelectUnitCellRendererComponent,
        SelectUserCellRendererComponent,
    ],
    exports: [
        ExactFilterPipe
    ],
    imports: [
        UsersRoutingModule,
        CommonModule,
        NbCardModule,
        NbButtonModule,
        FlexModule,
        NbIconModule,
        NbInputModule,
        NbFormFieldModule,
        NbSelectModule,
        NbWindowModule.forChild(),
        AgGridModule.withComponents([SelectUnitCellRendererComponent]),
        RouterModule,
        ReactiveFormsModule,
        NbTooltipModule,
        NbLayoutModule,
        NbTabsetModule,
        NbToggleModule,
        AssetsModule,
        NbSpinnerModule,
    ]
})
export class UsersModule {
}
