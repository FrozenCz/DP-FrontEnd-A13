import {Injectable} from '@angular/core';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {UsersService} from '../users/users.service';
import {CategoriesService} from '../categories/categories.service';
import {Transforms} from '../utils/Transforms';
import {Asset} from '../assets/models/assets.model';
import {LocationService} from '../locations/location.service';
import {UnitsService} from '../units/units.service';
import {TransferDataProvider} from '../transfer/components/abstract/transferDataProvider';
import {Caretaker} from '../users/model/caretaker.model';
import {TokenService} from '../auth/token.service';
import {HttpClient} from '@angular/common/http';
import {restIp} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Facade implements TransferDataProvider {

  constructor(
    private assetsService: AssetsService,
    private usersService: UsersService,
    private categoryService: CategoriesService,
    private locationService: LocationService,
    private unitService: UnitsService,
    private tokenService: TokenService,
    private httpClient: HttpClient
  ) {
  }

  getAssetExt(source: AssetSource): Observable<IAssetsExt[]> {
    let obs: Observable<Asset[]> = this.assetsService.assetsStore$.getAll$();
    if (source === AssetSource.WORKING_LIST) {
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


  getCaretakers$(): Observable<Caretaker[]> {
    return this.usersService.getCaretakers$()
  }

  getCaretaker$(): Observable<Caretaker> {
    return this.tokenService.getToken()
      .pipe(
        switchMap(jwtToken => {
          return this.usersService.getCaretakers$().pipe(
            map(caretakers => {
              const userFound = caretakers.find(user => user.id === jwtToken?.userId);
              if (!userFound) {
                throw new Error('Caretaker not found!');
              }
              return userFound;
            })
          )
        })
      )
  }

  sendRequestForAssetTransfer(fromUser: number, toUser: number, assetIds: number[], message: string): Observable<void> {
    return this.httpClient.post<void>('/rest/assets/transfers', {fromUser, toUser, assetIds, message});
  }


}


export enum AssetSource {
  STORE,
  WORKING_LIST,
  SELECTED_IN_GRID
}
