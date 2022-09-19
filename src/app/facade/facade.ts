import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {UsersService} from '../users/users.service';
import {CategoriesService} from '../categories/categories.service';
import {Transforms} from '../utils/Transforms';
import {Asset} from '../assets/models/assets.model';


@Injectable({
  providedIn: 'root'
})
export class Facade {

  constructor(private assetsService: AssetsService, private usersService: UsersService, private categoryService: CategoriesService) {
  }

  getAssetExt(source: AssetSource): Observable<IAssetsExt[]> {
    let obs: Observable<Asset[]> = this.assetsService.assetsStore$.getAll$();
    if(source === AssetSource.workingList) {
      obs = this.assetsService.getAssetsWorkingList$().pipe(map(assetsMap => Array.from(assetsMap.values())));
    }
    return combineLatest([
      obs,
      this.usersService.getUsersMap$(),
      this.categoryService.categoriesStore$.getMap$()
    ]).pipe(
      map(([assets, users, categories]) => {
        return assets.map(asset => {
          return Transforms.getAssetModelExt(asset, users, categories);
        })
      })
    )
  }
}


export enum AssetSource {
  store,
  workingList
}
