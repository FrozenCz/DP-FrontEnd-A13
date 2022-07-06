import {Component, Input, OnInit} from '@angular/core';
import {IUser, IUserWithRights} from '../../model/user.model';
import {IRightsGet, UsersService} from '../../users.service';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {forkJoin, Subject} from 'rxjs';
import {RightsCategoryEnum} from '../../../shared/rights.list';
import {take, tap} from 'rxjs/operators';

interface IRightsGetExtended extends IRightsGet {
  selected: boolean;
}

interface RightsCategory {
  name: string;
  icon: string;
  relatedTo: RightsCategoryEnum;
}

@Component({
  selector: 'app-show-rights-setting-dialog',
  templateUrl: './show-rights-setting-dialog.component.html',
  styleUrls: ['./show-rights-setting-dialog.component.scss']
})

export class ShowRightsSettingDialogComponent implements OnInit {
  @Input() user!: IUser;
  userWithRights: IUserWithRights;
  loaded$ = new Subject();
  rights: IRightsGetExtended[] = [];
  rightsCategory: RightsCategory[] = [
    {name: 'Uživatelé', relatedTo: RightsCategoryEnum.users, icon: 'person'},
    {name: 'Umístění', relatedTo: RightsCategoryEnum.locations, icon: 'compass'},
    {name: 'Majetek', relatedTo: RightsCategoryEnum.assets, icon: 'monitor-outline'},
    {name: 'Jednotky', relatedTo: RightsCategoryEnum.units, icon: 'layers'},
    {name: 'Kategorie', relatedTo: RightsCategoryEnum.categories, icon: 'keypad-outline'},
    // {name: 'Práva', relatedTo: RightsCategoryEnum.rights, icon: 'settings-2'},
  ];
  rightsToAdd: number[] = [];
  rightsToRemove: number[] = [];

  constructor(private usersService: UsersService, private nbDialogRef: NbDialogRef<ShowRightsSettingDialogComponent>, private nbToastrService: NbToastrService) {
    this.userWithRights = {...this.user, rights: []};
  }

  ngOnInit(): void {
    const rights$ = this.usersService.getRights();
    const user$ = this.usersService.getUserWithRights(this.user.id);


    forkJoin([rights$, user$]).subscribe(([rights, user]) => {
      this.loaded$.next(true);
      this.rights = rights.map((right) => {
        const rightExtended: IRightsGetExtended = {...right, selected: !!user.rights.find(r => r.id === right.id)};
        return rightExtended;
      });
    });

  }

  dismiss(): void {
    this.nbDialogRef.close();
  }

  changeRights(right: IRightsGetExtended): void {
    const {id} = right || {};
    const rightsSelected = !right.selected; // vstupni hodnota je opacna nez na co se meni !!!

    /* pokud je pravo u uzivatele, tak v pripade odznaceni jej budeme odebirat */
    if (this.userWithRights.rights.find(rights => rights.id === right.id)) {
      if (!rightsSelected) {
        this.rightsToRemove.push(id);
      } else {
        this.rightsToRemove = this.rightsToRemove.slice(0).filter(n => n !== id);
      }
    } else {
      if (rightsSelected) {
        this.rightsToAdd.push(id);
      } else {
        this.rightsToAdd = this.rightsToAdd.slice(0).filter(n => n !== id);
      }
    }
  }

  OnSaveRightsButtonClicked(): void {
    this.usersService.saveUsersRights(this.user.id, this.rightsToAdd, this.rightsToRemove)
      .subscribe((newRights) => {
        this.userWithRights.rights = newRights;
        this.rightsToRemove = [];
        this.rightsToAdd = [];
        this.nbToastrService.success('Práva nastavena', 'Práva', {duration: 2000, icon: 'settings-2-outline'});
      },
      err => {
          this.nbToastrService.danger(err.error.message, 'Chyba uložení', {duration: 10000, icon: 'alert-triangle-outline'});
      }
    );
  }
}
