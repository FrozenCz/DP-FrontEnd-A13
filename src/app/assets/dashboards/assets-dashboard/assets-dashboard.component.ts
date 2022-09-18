import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Observable, Subject, tap} from 'rxjs';
import {AssetsService, IAssetsExt} from '../../assets.service';
import {map, takeUntil} from 'rxjs/operators';
import {Asset, AssetModelExt, AssetState, IAssetCategory} from '../../models/assets.model';
import {UsersService} from '../../../users/users.service';
import {CategoriesService} from '../../../categories/categories.service';
import {User} from '../../../users/model/user.model';
import {Category} from '../../../categories/models/category.model';

@Component({
  selector: 'app-assets-dashboard',
  templateUrl: './assets-dashboard.component.html',
  styleUrls: ['./assets-dashboard.component.scss']
})
export class AssetsDashboardComponent {
  // todo: zde uz bude interface, ktery bude obsahovat i to co me zajima, takze kategorie a uzivatele...
  assets$: Observable<IAssetsExt[]>

  constructor(private assetsService: AssetsService, private usersService: UsersService, private categoryService: CategoriesService) {
    this.assets$ = combineLatest([
      this.assetsService.assetsStore$.getAll$(),
      this.usersService.getUsersMap$(),
      this.categoryService.categoriesStore$.getMap$()
    ]).pipe(
      tap((cotam) => {
        console.log(cotam)
      }),
      map(([assets, users, categories]) => {
        return assets.map(asset => {
          return this.getAssetModelExt(asset, users, categories);
        })
    })
    )
  }


  private getAssetModelExt(asset: Asset, users: Map<number, User>, categories: Map<number, Category>): IAssetsExt {
    const category = categories.get(asset.category_id);
    const userIn = users.get(asset.user_id);

    if (!category) {
      throw new Error('Category ID not found')
    }

    if (!userIn) {
      throw new Error('User id not found');
    }

    return {
      categories: category.tree,
      id: asset.id,
      asset: {
        id: asset.id,
        category: {
          name: category.name,
          id: category.id
        },
        name: asset.name,
        quantity: asset.quantity,
        user: userIn,
        serialNumber: asset.serialNumber,
        inventoryNumber: asset.inventoryNumber,
        evidenceNumber: asset.evidenceNumber,
        identificationNumber: asset.identificationNumber,
        inquiryDate: asset.inquiryDate,
        document: asset.document,
        inquiryPrice: asset.inquiryPrice,
        location: asset.location,
        locationEtc: asset.locationEtc,
        note: asset.note,
        state: asset.state,
      }
    }
  }




}
