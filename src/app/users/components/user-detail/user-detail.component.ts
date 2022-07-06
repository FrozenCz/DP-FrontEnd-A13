import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {JwtToken, TokenService} from '../../../auth/token.service';
import {RightsTag} from '../../../shared/rights.list';
import {IUser, IUserChanges, IUserExt} from '../../model/user.model';
import {UsersService} from '../../users.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UnitsService} from '../../../units/units.service';
import {Observable, Subject} from 'rxjs';
import {Unit} from '../../../units/models/unit.model';
import {NbComponentSize, NbDialogService, NbToastrService, NbWindowRef} from '@nebular/theme';
import {ShowRightsSettingDialogComponent} from '../show-rights-setting-dialog/show-rights-setting-dialog.component';
import {take, takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  @Input() context: any;
  @Input() userId!: number;
  updateUsersInformationAllowed = false;
  setPermissionsAllowed = false;
  token: JwtToken | undefined = undefined;
  private unsubscribe = new Subject();

  editMode = false;
  user!: IUserExt;
  units$!: Observable<Unit[]>;

  userEditForm: FormGroup;
  buttonSize: NbComponentSize = 'medium';

  constructor(
    private tokenService: TokenService,
    private unitsService: UnitsService,
    private usersService: UsersService,
    private nbToastrService: NbToastrService,
    private nbWindowRef: NbWindowRef,
    private nbDialogService: NbDialogService
  ) {
    this.tokenService.getToken().pipe(takeUntil(this.unsubscribe)).subscribe((token) => {
      this.token = token;
      this.updateUsersInformationAllowed = this.tokenService.getPermission(RightsTag.updateUsersInformation);
      this.setPermissionsAllowed = this.tokenService.getPermission(RightsTag.settingRights);
    });
    this.userEditForm = new FormGroup({
      name: new FormControl({value: '', disabled: true}, [Validators.required]),
      surname: new FormControl({value: '', disabled: true}, [Validators.required]),
      unitId: new FormControl({value: '', disabled: true})
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }

  ngOnInit(): void {
    this.units$ = this.unitsService.getUnits();
    this.usersService.getUser(this.userId).pipe(takeUntil(this.unsubscribe)).subscribe(
      (user) => {
        this.user = user;
        if (this.user) {
          if (!this.user.reachable) {
            this.units$ = this.unitsService.getAllUnits();
          }
          this.resetValues(this.user);
        }
        if (!this.user.id) {
          throw new Error('Nepodařilo se načíst uživatele');
        }
      }
    );

  }

  setEditModeTo(bool: boolean): void {
    this.editMode = bool;
    if (bool) {
      for (const controlsKey of Object.keys(this.userEditForm.controls)) {
        this.userEditForm.controls[controlsKey].enable();
      }
    } else {
      for (const controlsKey of Object.keys(this.userEditForm.controls)) {
        this.userEditForm.controls[controlsKey].disable();
      }
    }
  }

  async onSubmit(): Promise<void> {
    const changes: IUserChanges = {};
    const user = this.user;
    for (const cKey of Object.keys(this.userEditForm.controls)) {
      const keyAs = cKey as keyof typeof user;
      const keyAsCh = cKey as keyof typeof changes;
      if (user[keyAs] !== this.userEditForm.controls[keyAs].value) {
        changes[keyAsCh] = this.userEditForm.controls[keyAs].value;
      }
    }

    this.usersService.updateUser(this.userId, changes)
      .toPromise()
      .then(
        (result) => {
          this.nbToastrService.success('upraveno', 'Úprava profilu', {duration: 2000});
          this.setEditModeTo(false);
        })
      .catch(
        (err) => {
          let errorMessage;
          if (err.status === 404) {
            errorMessage = 'Uživatel nenalezen.';
          } else if (err.status === 403) {
            errorMessage = 'Nemáte potřebná oprávnění.';
          } else if (err.status === 401) {
            errorMessage = 'Nejste přihlášen';
          } else if (err.status === 400 && err.error?.message === 'Not specified any changes') {
            errorMessage = 'Nezadali jste žádnou změnu';
          } else {
            errorMessage = 'Neznámá chyba. Kontaktujte správce.';
          }
          this.nbToastrService.danger(errorMessage, 'Úprava profilu', {duration: 10000});
          return false;
        }
      );


    // todo: nezapomenou vratit zpet mod
  }

  resetValues(user: IUser): void {
    this.userEditForm.patchValue({
      name: this.user.name,
      surname: this.user.surname,
      unitId: this.user.unit?.id ? this.user.unit.id : null
    });
  }

  dismiss(): void {
    this.nbWindowRef.close();
  }

  showRightsSettingDialog(): void {
    this.nbDialogService.open(ShowRightsSettingDialogComponent, {
      context: {
        user: this.user
      }
    });
  }
}
