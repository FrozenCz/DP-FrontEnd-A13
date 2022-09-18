import {Component, OnDestroy} from '@angular/core';
import {AuthService} from './auth.service';
import {NbDialogService, NbToastrService} from '@nebular/theme';
import {LoginFormDialogComponent} from './components/login-form-dialog/login-form-dialog.component';
import {JwtToken, TokenService} from './token.service';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LoggedUserDetailComponent} from './components/logged-user-detail/logged-user-detail.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  token$: Observable<JwtToken | undefined>

  constructor(private authService: AuthService,
              private nbDialogService: NbDialogService,
              private tokenService: TokenService,
              private toastrService: NbToastrService) {
    this.token$ = this.tokenService.getToken()
  }

  showLoginDialog(): void {
    this.nbDialogService.open(LoginFormDialogComponent, {
        context: {
          toastrService: this.toastrService
        }
      }
    )
  }

  logOut(): void {
    this.tokenService.logOut();
    this.toastrService.info('Odhlášení úspěšné', 'Odlášení', {duration: 2000});
  }

  onShowUserClick(token: JwtToken): void {
    this.nbDialogService.open(LoggedUserDetailComponent, {
      context: {
        jwtToken: token
      }
    })
  }
}
