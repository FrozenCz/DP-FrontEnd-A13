import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {UsersService} from '../users/users.service';
import {CategoriesService} from '../categories/categories.service';
import {Transforms} from '../utils/Transforms';
import {Asset} from '../assets/models/assets.model';
import {LocationService} from '../locations/location.service';


@Injectable({
  providedIn: 'root'
})
export class Facade {

  constructor(
    private assetsService: AssetsService,
    private usersService: UsersService,
    private categoryService: CategoriesService,
    private locationService: LocationService
  ) {
  }

  getAssetExt(source: AssetSource): Observable<IAssetsExt[]> {
    let obs: Observable<Asset[]> = this.assetsService.assetsStore$.getAll$();
    if(source === AssetSource.WORKING_LIST) {
      obs = this.assetsService.getAssetsWorkingList$().pipe(map(assetsMap => Array.from(assetsMap.values())));
    } else if (source === AssetSource.SELECTED_IN_GRID) {
      obs = this.assetsService.getAssetsSelectedInGridList$().pipe(map(assetsMap => Array.from(assetsMap.values())));
    }
    return combineLatest([
      obs,
      this.usersService.getUsersMap$(),
      this.categoryService.categoriesStore$.getMap$(),
      this.locationService.locationStore.getMap$()
    ]).pipe(
      map(([assets, users, categories, locations]) => {
        return assets.map(asset => {
          return Transforms.getAssetModelExt(asset, users, categories, locations);
        })
      })
    )
  }
}


export enum AssetSource {
  STORE,
  WORKING_LIST,
  SELECTED_IN_GRID
}
