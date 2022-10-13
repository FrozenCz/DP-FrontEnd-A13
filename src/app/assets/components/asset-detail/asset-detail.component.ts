import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {firstValueFrom, noop, Observable, startWith, Subject} from 'rxjs';
import {
  Asset,
  ASSETS_INFORMATION, AssetsChanges,
  AssetsModelDto,
  AssetState,
} from '../../models/assets.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../users/model/user.model';
import {HistoryModel} from '../../../history/models/history.model';
import {TokenService} from '../../../auth/token.service';
import {UsersService} from '../../../users/users.service';
import {AssetsService} from '../../assets.service';
import {NbToastrService} from '@nebular/theme';
import {map, take, tap} from 'rxjs/operators';
import {Category} from '../../../categories/models/category.model';
import {Location} from '../../../locations/model/location';
import {LocationWs} from '../../../locations/model/location.ws';


enum AssetDetailTabEnum {
  detail,
  notes,
  history
}

export interface ICategory {
  id: number;
  name: string;
  tree: string[];
}

interface IControlsByRights {
  assetInformation: string[];
}

export interface AssetDetailPermissions {
  rtChangeAssetsUser: boolean;
  rtChangeAssetsInformation: boolean;
  rtCreateAsset: boolean
}

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss']
})
export class AssetDetailComponent implements OnDestroy, OnInit {
  @Input() category!: Category;
  @Input() locations!: Map<string, Location>;
  @Input() asset!: Asset;
  @Input() users: Map<number, User> = new Map<number, User>();
  @Input() permissions: AssetDetailPermissions | null = null;
  @Output() onClose: EventEmitter<undefined> = new EventEmitter<undefined>();
  assetStates = AssetState;
  editMode = false;
  categoryTree = '';
  filteredControlLocation$: Observable<Location[]>;

  unsubscribe = new Subject();
  private editorUserId: number | undefined;
  assetForm: FormGroup;


  noteForm: FormGroup;
  showTemplate: AssetDetailTabEnum = AssetDetailTabEnum.detail;
  reachToUser = false;
  history!: HistoryModel;
  usersMap: Map<number, User> = new Map<number, User>();

  constructor(
    private tokenService: TokenService,
    private formBuilder: FormBuilder,
    public usersService: UsersService,
    private assetsService: AssetsService,
    private toastrService: NbToastrService,
  ) {

    this.assetForm = this.formBuilder.group({
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100000)]],
      name: [null],
      user: [null, [Validators.required]],
      serialNumber: [null, [Validators.maxLength(50)]],
      inventoryNumber: [null, [Validators.maxLength(50)]],
      evidenceNumber: [null, [Validators.maxLength(50)]],
      identificationNumber: [null, [Validators.maxLength(50)]],
      inquiryDate: [new Date()],
      inquiryPrice: [null, [Validators.max(9999999999)]],
      document: [null, [Validators.maxLength(20)]],
      location: [null, [Validators.maxLength(50)]],
      locationEtc: [null, [Validators.maxLength(150)]],
      note: [null, [Validators.maxLength(250)]]
    });
    this.noteForm = this.formBuilder.group({
      userNote: [null, [Validators.required, Validators.maxLength(100000)]]
    });

    this.filteredControlLocation$ = this.assetForm.get('location')!.valueChanges
      .pipe(
        startWith(''),
        tap(typed => {
          if (typeof typed === 'string' || typed === null) {
            this.assetForm.get('location')!.setErrors({guarantee: 'Not selected'});
          } else {
            if (typed && typed.name && typed.surname && typed.logon) {
              this.assetForm.get('location')!.setErrors(null);
            }
          }
        }),
        map(filterString => this.filtering(filterString))
      );

  }

  private filtering(name: string): Location[] {
    console.log(this.locations.values());
    if (!name) return [];
    const filterValue = name.toString().toLowerCase();
    const locationsArr = Array.from(this.locations?.values()?? []) ;
    return locationsArr.filter(location => (location.name).toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {

    if (this.asset.id >= 0) {
      this.insertAssetDataIntoDetailForm(this.asset, this.users);
      this.setEditModeTo(false);
      this.categoryTree = this.category.categoryTreeForDetail;
    } else {
      this.setEditModeTo(true);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }


  async setEditModeTo(bool: boolean): Promise<void> {
    this.editMode = bool;

    if (!this.asset) {
      return;
    }

    if (bool) {
      const userInAsset = await firstValueFrom(this.usersService.getUser(this.asset.user_id));
      if (this.permissions?.rtChangeAssetsUser && userInAsset.reachable) {
        // todo: kurva proc tu porad menim uzivatele?
        // this.users$ = this.usersService.getUsers$().pipe(map(users => users.filter(user => user.reachable)));
      }

      for (const controlsKey of Object.keys(this.assetForm.controls)) {

        if ((!this.permissions?.rtChangeAssetsUser && controlsKey === 'user') || !userInAsset.reachable) {
          continue;
        }

        if ((!this.permissions?.rtChangeAssetsInformation && ASSETS_INFORMATION.includes(controlsKey))) {
          continue;
        }

        this.assetForm.controls[controlsKey].enable();
      }
      // todo: note by user
      // this.assetForm.controls['usernote'].enable();
    } else {
      for (const controlsKey of Object.keys(this.assetForm.controls)) {
        this.assetForm.controls[controlsKey].disable();
      }
    }
  }

  dismiss(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (this.asset.id === -1) {
      this.createAsset();
    } else {
      this.updateAssetPrepare();
    }
  }

  private createAsset(): void {
    this.assetsService.createAsset({
      categoryId: this.category.id,
      quantity: this.assetForm.get('quantity')?.value,
      userId: this.assetForm.get('user')?.value.id,
      serialNumber: this.assetForm.get('serialNumber')?.value,
      inventoryNumber: this.assetForm.get('inventoryNumber')?.value,
      evidenceNumber: this.assetForm.get('evidenceNumber')?.value,
      identificationNumber: this.assetForm.get('identificationNumber')?.value,
      inquiryDate: this.assetForm.get('inquiryDate')?.value,
      inquiryPrice: this.assetForm.get('inquiryPrice')?.value,
      document: this.assetForm.get('document')?.value,
      location: this.assetForm.get('location')?.value,
      locationEtc: this.assetForm.get('locationEtc')?.value,
      note: this.assetForm.get('note')?.value,
    }).pipe(take(1))
      .subscribe(() => {
        this.toastrService.success('úspěšně přidán', 'Majetek', {duration: 2000, icon: 'checkmark-outline'});
        this.dismiss();
      }, error => {
        if (error.status === 401) {
          this.toastrService.danger('nejste přihlášen/a, majetek nebyl vložen', 'Nepřihlášení', {
            duration: 10000,
            icon: 'alert-triangle-outline'
          });
        } else {
          this.toastrService.danger('nebyl vložen, došlo k chybě', 'Majetek', {
            duration: 10000,
            icon: 'alert-triangle-outline'
          });
        }
      });
  }

  saveNote(): void {
    this.assetsService.createAssetNote(this.asset.id, this.noteForm.value.userNote).subscribe(noop);
  }

  private updateAssetPrepare(): void {
    const changes: Partial<AssetsChanges> = {};
    const changesInformation: Partial<AssetsModelDto> = {};

    for (const controlsKey in this.assetForm.controls) {
      if (this.assetForm.controls[controlsKey].dirty && this.assetForm.controls[controlsKey].touched) {
        const asChKey = controlsKey as keyof typeof changes;
        const asChIKey = controlsKey as keyof typeof changesInformation;
        changes[asChKey] = this.assetForm.controls[controlsKey].value;
        if (!!this.permissions?.rtChangeAssetsInformation && ASSETS_INFORMATION.includes(controlsKey)) {
          changesInformation[asChIKey] = this.assetForm.controls[controlsKey].value;
        }
      }
    }

    if (changes.user && changes.user.id !== this.asset.user_id) {
      this.assetsService.changeAssetUser(this.asset.id, changes.user.id).pipe(take(1))
        .subscribe((asset) => {
          this.toastrService.success('úspěšně změněn', 'Uživatel', {icon: 'user'});
          this.assetForm.controls['user'].markAsUntouched();
        }, () => {
          this.toastrService.danger('nebyl změněn', 'Uživatel', {icon: 'user'});
        });
    }

    if (!!Object.keys(changesInformation).length) {
      this.assetsService.changeAssetInformation(this.asset.id, changesInformation)
        .pipe(take(1))
        .subscribe(() => {
            this.toastrService.success('úspěšně změněn', 'Majetek', {icon: 'monitor-outline'});

          },
          error => {
            this.toastrService.danger('informace nebyly změněny', 'Majetek', {icon: 'monitor-outline'});
          });
    }

    this.setEditModeTo(false);
  }

  insertAssetDataIntoDetailForm(asset: Asset, users: Map<number, User>): void {
    this.assetForm.patchValue(
      {
        quantity: asset.quantity,
        name: asset.name,
        user: users.get(asset.user_id),
        serialNumber: asset.serialNumber,
        inventoryNumber: asset.inventoryNumber,
        evidenceNumber: asset.evidenceNumber,
        identificationNumber: asset.identificationNumber,
        inquiryDate: asset?.inquiryDate ? new Date(asset.inquiryDate) : new Date(),
        inquiryPrice: asset.inquiryPrice,
        document: asset.document,
        location: asset.location_id,
        locationEtc: asset.locationEtc,
        note: asset.note
      },
    );
    const preselectedUserId = this.asset ? this.asset.user_id : this.editorUserId;
    if (preselectedUserId) {
      this.assetForm.patchValue({
        user: users.get(preselectedUserId)
      });
    }
  }

  ableToEdit(): boolean {
    return !!this.users.get(this.asset.user_id)?.reachable && this.asset.state === this.assetStates.actual;
  }

  private getAsset(assetId: number): Observable<Asset> {
    const found = this.assetsService.getRawAsset(assetId);
    if (!found) {
      this.toastrService.warning('Majetek nebyl nalezen');
    }
    return found;
  }

  resetForm(): void {
    // todo: udělat reset formulare
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  showLocation(location: Location | string): any {
    if (location instanceof Location && location?.name) {
      return location.name + (location.parent ? ' ('+location.parent.name+') ' : '');
    }
    return location
  }


}

