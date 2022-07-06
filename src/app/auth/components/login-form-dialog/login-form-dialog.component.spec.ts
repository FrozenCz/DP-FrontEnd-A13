import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormDialogComponent } from './login-form-dialog.component';
import {NbDialogRef} from '@nebular/theme';
import {AuthService} from '../../auth.service';
import {TokenService} from '../../token.service';

const mockProviders = () => ({

});

describe('LoginFormDialogComponent', () => {
  let component: LoginFormDialogComponent;
  let fixture: ComponentFixture<LoginFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginFormDialogComponent ],
      providers: [
        {provide: NbDialogRef, useFactory: mockProviders},
        {provide: AuthService, useFactory: mockProviders},
        {provide: TokenService, useFactory: mockProviders},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
