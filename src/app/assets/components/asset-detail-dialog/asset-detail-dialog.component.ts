import {Component, Input, OnInit} from '@angular/core';
import {combineLatest, Observable, of, switchMap, tap} from 'rxjs';
import {NbWindowRef} from '@nebular/theme';
import {AssetDetailPermissions} from '../asset-detail/asset-detail.component';
import {Asset} from '../../models/assets.model';
import {AssetsService} from '../../assets.service';
import {User} from '../../../users/model/user.model';
import {RightsTag} from '../../../shared/rights.list';
import {UsersService} from '../../../users/users.service';
import {TokenService} from '../../../auth/token.service';
import {Category} from '../../../categories/models/category.model';
import {CategoriesService} from '../../../categories/categories.service';

@Component({
  selector: 'app-create-assets-dialog',
  templateUrl: './asset-detail-dialog.component.html',
  styleUrls: ['./asset-detail-dialog.component.scss']
})

export class AssetDetailDialogComponent implements OnInit {
  @Input() selectedCategoryId!: number;
  @Input() assetId: number = -1;
  asset$!: Observable<Asset>;
  users$!: Observable<Map<number, User>>;
  category$!: Observable<Category>;
  permissions: AssetDetailPermissions | null = null;
  dataPrepared$!: Observable<[Asset, Map<number, User>, Category]>;

  constructor(
    private nbWindowRef: NbWindowRef,
    private assetService: AssetsService,
    private usersService: UsersService,
    private tokenService: TokenService,
    private categoryService: CategoriesService
  ) {

  }

  ngOnInit(): void {

    this.users$ = this.tokenService.getToken()
      .pipe(
        switchMap((token) => {
          return this.usersService.getUsersMap$()
        }),
        tap(() => {
          this.permissions = {
            rtChangeAssetsUser: this.tokenService.getPermission(RightsTag.changeAssetsUser),
            rtChangeAssetsInformation: this.tokenService.getPermission(RightsTag.changeAssetsInformation),
            rtCreateAsset: this.tokenService.getPermission(RightsTag.createAssets),
          }
        }))

    if (this.assetId === -1) {
      this.asset$ = of(new Asset(this.selectedCategoryId));
    } else {
      this.asset$ = this.assetService.assetsStore$.getOne$(this.assetId)
    }

    this.category$ = this.asset$.pipe(
      switchMap(asset => this.categoryService.getCategoryById(asset.category_id))
    )

    this.dataPrepared$ = combineLatest([this.asset$, this.users$, this.category$]);

  }

  dismiss(): void {
    this.nbWindowRef.close();
  }
}
