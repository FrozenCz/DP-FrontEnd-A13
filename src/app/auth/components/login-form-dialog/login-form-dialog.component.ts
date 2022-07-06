import {Component, Input, OnInit} from '@angular/core';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {AuthService} from '../../auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TokenService} from '../../token.service';

@Component({
  selector: 'app-login-form-dialog',
  templateUrl: './login-form-dialog.component.html',
  styleUrls: ['./login-form-dialog.component.scss']
})
export class LoginFormDialogComponent implements OnInit {
  @Input() loginForm: FormGroup;
  toastrService!: NbToastrService;
  username: string = '';
  password: string = '';


  constructor(private nbDialogRef: NbDialogRef<LoginFormDialogComponent>,
              private authService: AuthService,
              private tokenService: TokenService,
  ) {
    this.loginForm = new FormGroup({
        username: new FormControl(this.username, [Validators.required, Validators.minLength(6)]),
        password: new FormControl(this.password, [Validators.required, Validators.minLength(8)]),
      }
    );
  }

  ngOnInit(): void {
  }

  dismiss(): void {
    this.nbDialogRef.close();
  }

  async login(): Promise<void> {
    const {username, password} = this.loginForm.controls;

    this.authService.login(username.value, password.value).subscribe(response => {
      if (response?.accessToken) {
        this.tokenService.logIn(response.accessToken);
        this.dismiss();
        this.toastrService.success('Přihlášení úspěšné', 'Přihlášen', {duration: 2000});
      } else {
        alert('error');
      }
    },
      error => {
      switch (error.status) {
        case 401:
          this.toastrService.danger('špatné přihlašovací údaje', 'Nepřihlášen', {duration: 10000});
          break;
        case 504:
          this.toastrService.danger('spojení se serverem nenalezeno', 'Nepřihlášen', {duration: 10000});
          break;
        default:
          this.toastrService.danger('neznámá chyba', 'Nepřihlášen', {duration: 10000});
          break;
      }});
  }

}
