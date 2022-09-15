import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {combineLatest, first, firstValueFrom, noop, Observable, of, Subject, switchMap, tap} from 'rxjs';
import {AssetModelExt, ASSETS_INFORMATION, AssetsModelDto, ICreateAsset} from '../../models/assets.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IUserExt} from '../../../users/model/user.model';
import {HistoryModel} from '../../../history/models/history.model';
import {TokenService} from '../../../auth/token.service';
import {UsersService} from '../../../users/users.service';
import {AssetsService} from '../../assets.service';
import {NbToastrService} from '@nebular/theme';
import {HistoryService} from '../../../history/history.service';
import {filter, map, take, takeUntil, withLatestFrom} from 'rxjs/operators';
import {RightsTag} from '../../../shared/rights.list';
import {CategoriesService} from '../../../categories/categories.service';


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

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss']
})
export class AssetDetailComponent implements OnDestroy, OnInit {
  @Input() selectedCategory!: Observable<ICategory>;
  @Input() assetId!: number;
  @Output() onClose: EventEmitter<undefined> = new EventEmitter<undefined>();
  loading: boolean = false;
  categoryTree = '';

  editedAsset!: AssetModelExt;
  rtChangeAssetsUser = false;
  rtChangeAssetsInformation = false;
  rtCreateAsset = false;
  unsubscribe = new Subject();

  private editorUserId: number | undefined;
  assetForm: FormGroup;
  noteForm: FormGroup;
  editMode = false;
  users$: Observable<IUserExt[]>;

  showTemplate: AssetDetailTabEnum = AssetDetailTabEnum.detail;
  reachToUser = false;
  history!: HistoryModel;

  constructor(
    private tokenService: TokenService,
    private formBuilder: FormBuilder,
    public usersService: UsersService,
    private assetsService: AssetsService,
    private toastrService: NbToastrService,
    private historyService: HistoryService,
    private categoriesService: CategoriesService
  ) {
    this.users$ = this.tokenService.getToken()
      .pipe(
        switchMap((token) => {
          this.editorUserId = token?.userId;
          return this.usersService.getUsers$()
        }),
        tap(() => {
          this.rtChangeAssetsUser = this.tokenService.getPermission(RightsTag.changeAssetsUser);
          this.rtChangeAssetsInformation = this.tokenService.getPermission(RightsTag.changeAssetsInformation);
          this.rtCreateAsset = this.tokenService.getPermission(RightsTag.createAssets);
        }))

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
  }

  ngOnInit(): void {
    if (this.assetId) {
      this.loading = true;
      this.getAsset(this.assetId)
        .pipe(
          withLatestFrom(this.usersService.getUsers$().pipe(take(1))),
          switchMap(([asset, users]) => {
            this.editedAsset = asset;
            this.insertAssetDataIntoDetailForm(asset, users);
            this.reachToUser = !!this.editedAsset?.user?.reachable;
            this.setEditModeTo(false);
            return this.categoriesService.getCategoryById(asset.category.id)
          }),
          tap(category => {
            const catTree = CategoriesService.getCategoryTreeForDetail(category);
            this.categoryTree = catTree ? catTree : '';
            this.loading = false;
          }),
          takeUntil(this.unsubscribe))
        .subscribe()
    } else {
      this.setEditModeTo(true);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }


  setEditModeTo(bool: boolean): void {
    this.editMode = bool;

    if (!this.editedAsset && !this.assetId && this.rtCreateAsset) {
      this.users$ = this.usersService.getUsers$().pipe(map(users => users.filter(user => user.reachable)));
    }

    if (!this.editedAsset) {
      return;
    }

    if (bool) {
      if (this.rtChangeAssetsUser && this.editedAsset.user.reachable) {
        this.users$ = this.usersService.getUsers$().pipe(map(users => users.filter(user => user.reachable)));
      }

      for (const controlsKey of Object.keys(this.assetForm.controls)) {

        if ((!this.rtChangeAssetsUser && controlsKey === 'user') || !this.editedAsset.user.reachable) {
          continue;
        }

        if ((!this.rtChangeAssetsInformation && ASSETS_INFORMATION.includes(controlsKey))) {
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
    if (!this.editedAsset) {
      this.createAsset();
    } else {
      this.updateAssetPrepare();
    }
  }


  private createAsset(): void {
    this.selectedCategory.pipe(take(1)).subscribe(
      category => {
        const newAsset: ICreateAsset = this.assetForm.value;
        newAsset.categoryId = category.id;
        newAsset.userId = this.assetForm.value.user.id;
        this.assetsService.createAsset(newAsset).pipe(take(1))
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
    );
  }

  saveNote(): void {
    this.assetsService.createAssetNote(this.assetId, this.noteForm.value.userNote).subscribe(noop);
  }

  private updateAssetPrepare(): void {
    const changes: Partial<AssetsModelDto> = {};
    const changesInformation: Partial<AssetsModelDto> = {};

    for (const controlsKey in this.assetForm.controls) {
      if (this.assetForm.controls[controlsKey].dirty && this.assetForm.controls[controlsKey].touched) {
        const asChKey = controlsKey as keyof typeof changes;
        const asChIKey = controlsKey as keyof typeof changesInformation;
        changes[asChKey] = this.assetForm.controls[controlsKey].value;
        if (this.rtChangeAssetsInformation && ASSETS_INFORMATION.includes(controlsKey)) {
          changesInformation[asChIKey] = this.assetForm.controls[controlsKey].value;
        }
      }
    }

    if (changes.user && changes.user.id !== this.editedAsset.user.id) {
      this.assetsService.changeAssetUser(this.assetId, changes.user).pipe(take(1)).subscribe((asset) => {
        this.toastrService.success('úspěšně změněn', 'Uživatel', {icon: 'user'});
        this.editedAsset = asset;
        this.assetForm.controls['user'].markAsUntouched();
      }, () => {
        this.toastrService.danger('nebyl změněn', 'Uživatel', {icon: 'user'});
      });
    }

    if (!!Object.keys(changesInformation).length) {
      this.assetsService.changeAssetInformation(this.editedAsset.id, changesInformation)
        .pipe(take(1))
        .subscribe(() => {
            this.toastrService.success('úspěšně změněn', 'Majetek', {icon: 'monitor-outline'});

          },
          error => {
            this.toastrService.danger('informace nebyly změněny', 'Majetek', {icon: 'monitor-outline'});
          });
    }


    this.setEditModeTo(false);
    // this.assetsService.updateAsset(changes, this.assetId).subscribe(console.log);
  }

  insertAssetDataIntoDetailForm(asset: AssetModelExt, users: IUserExt[]): void {
    this.assetForm.patchValue(
      {
        ...asset,
        inquiryDate: asset?.inquiryDate ? new Date(asset.inquiryDate) : new Date()
      },
    );
    const preselectedUserId = this.editedAsset ? this.editedAsset.user.id : this.editorUserId;
    this.assetForm.patchValue({
      user: users.find(u => u.id === preselectedUserId)
    });
  }

  private getAsset(assetId: number): Observable<AssetModelExt> {
    const found = this.assetsService.getRawAsset(assetId);
    if (!found) {
      this.toastrService.warning('Majetek nebyl nalezen');
    }
    return found;
  }

  resetForm(): void {
    // todo: udělat reset formulare
  }


}

