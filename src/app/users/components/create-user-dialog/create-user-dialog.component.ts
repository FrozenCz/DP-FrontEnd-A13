import {Component, OnDestroy, OnInit} from '@angular/core';
import {ICreateUser, UsersService} from '../../users.service';
import {NbComponentStatus, NbDialogRef, NbToastrService} from '@nebular/theme';
import { Subject} from 'rxjs';
import {Unit} from '../../../units/models/unit.model';
import {UnitsService} from '../../../units/units.service';
import {takeUntil} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormFuncs} from '../../../utils/form.funcs';
import {User} from '../../model/user.model';

@Component({
  templateUrl: './create-user-dialog.component.html',
})
/**
 * komponenta pro tvorbu uživatele
 * @author Milan Knop 2020
 */
export class CreateUserDialogComponent implements OnInit, OnDestroy {
  createUserForm: FormGroup;
  units: Unit[] = [];
  users: User[] = [];
  unsubscribe: Subject<void> = new Subject<void>();

  toastMessages = {
    username: {message: '', defaultMessage: 'Pouze písmena a číslice, Minimálně 6 znaků, max 20, bez mezer'},
    name: {defaultMessage: 'Minimálně 2, Maxinálně 30 znaků'},
    surname: {defaultMessage: 'Minimálně 2, Maxinálně 50 znaků'},
    password: {defaultMessage: 'Heslo musí obsahovat malé, velké písmeno a číslici nebo speciální znak'},
    password2: {message: '', defaultMessage: 'Hesla se shodují'},
  };


  constructor(
    private nbDialogRef: NbDialogRef<CreateUserDialogComponent>,
    private unitsService: UnitsService,
    private toastrService: NbToastrService,
    private usersService: UsersService
  ) {
    this.createUserForm = new FormGroup({
      username: new FormControl(null, [
        Validators.pattern(/^[A-zÁ-ž0-9]*$/),
        Validators.pattern(/^\S*$/),
        Validators.required, Validators.minLength(6),
        Validators.maxLength(20)
      ]),

      password: new FormControl(null, [
        Validators.pattern(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/u),
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20)
      ]),
      password2: new FormControl(null, [Validators.required]),
      surname: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[A-zÁ-ž]*$/),
        Validators.pattern(/^\S*$/),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[A-zÁ-ž]*$/),
        Validators.pattern(/^\S*$/),
        Validators.minLength(2),
        Validators.maxLength(30)
      ]),
      unit: new FormControl(null, [Validators.required]),
    });

    /** kontrola uzivatelskeho jmena */
    this.createUserForm.controls['username'].valueChanges.subscribe((usernameChanged) => {
      if (this.users.some(user => user.username === usernameChanged)) {
        this.createUserForm.controls['username'].setErrors({exists: 'name exists'});
        this.toastMessages.username.message = 'Jméno již existuje';
      } else {
        this.toastMessages.username.message = '';
      }
    });

    /** kontrola zda souhlasí hesla */
    this.createUserForm.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((valueChange) => {
      if (valueChange.password !== valueChange.password2) {
        this.createUserForm.controls['password2'].setErrors({notMatch: true});
        this.toastMessages.password2.message = 'Hesla se neshodují';
      } else if (valueChange.password2?.length > 5 && valueChange.password === valueChange.password2) {
        this.toastMessages.password2.message = '';
        this.createUserForm.controls['password2'].setErrors(null);
      }
    });
  }

  ngOnInit(): void {
    this.usersService.getUsers$()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(users => {
      this.users = users;
    });
    this.unitsService.getUnits()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(units => {
        this.units = units;
        if (units.length) {
          const sortedUnits = units.sort((a, b) => a.name.localeCompare(b.name))
          this.createUserForm.patchValue({unit: sortedUnits[0]});
        }

      })
  }

  createUser(username: string, name: string, surname: string, password: string, unitId: number): void {
    const newUser: ICreateUser = {name, password, surname, unitId, username};
    this.usersService.createUser(newUser).subscribe(
      () => {
        this.dismiss();
        this.toastrService.success('Uživatel vytvořen', 'Úspěch', {duration: 2000});
      },
      (err) => {
        this.toastrService.danger(err.error.message, 'Chyba', {duration: 10000});
      }
    );
  }

  dismiss(): void {
    // toaster s nbTooltip directive FIX
    document.querySelectorAll('.cdk-overlay-connected-position-bounding-box').forEach(s => s.remove());
    this.nbDialogRef.close();
  }

  submit(form: FormGroup): void {
    const {username, name, surname, password, unit} = form.controls || {};
    this.createUser(username.value, name.value, surname.value, password.value, unit.value.id);
  }

  status(formControl: AbstractControl): NbComponentStatus {
    return FormFuncs.status(formControl);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
