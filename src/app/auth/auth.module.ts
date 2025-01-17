import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthComponent} from './auth.component';
import {NbButtonModule, NbCardModule, NbDialogModule, NbIconModule, NbInputModule} from '@nebular/theme';
import { LoginFormDialogComponent } from './components/login-form-dialog/login-form-dialog.component';
import {FlexModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import { LoggedUserDetailComponent } from './components/logged-user-detail/logged-user-detail.component';



@NgModule({
  declarations: [AuthComponent,  LoginFormDialogComponent, LoggedUserDetailComponent],
  exports: [
    AuthComponent,
  ],
  imports: [
    CommonModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbDialogModule.forChild(),
    FlexModule,
    ReactiveFormsModule,
  ],
  providers: [
  ]
})
export class AuthModule { }
