import {Component, OnDestroy} from '@angular/core';
import {AuthService} from './auth.service';
import {NbDialogService, NbToastrService} from '@nebular/theme';
import {LoginFormDialogComponent} from './components/login-form-dialog/login-form-dialog.component';
import {TokenService} from './token.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnDestroy {
  logged: boolean = false;
  unsubscribe: Subject<void> = new Subject<void>();

  constructor(private authService: AuthService,
              private nbDialogService: NbDialogService,
              private tokenService: TokenService,
              private toastrService: NbToastrService) {
    this.tokenService.getToken()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((user) => {
        if (user) {
          this.logged = true;
        } else {
          this.logged = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
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
}
